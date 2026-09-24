import "server-only";

import { createHash } from "node:crypto";

import { evaluateRequest } from "@/domain/requests/evaluate";
import { INVALID_MESSAGE, type RequestResponse, RETRY_MESSAGE } from "@/domain/requests/response";
import type { RequestKind } from "@/domain/requests/fields";
import { businessMail, guestMail, type RequestMail } from "@/domain/requests/mail";
import type { GuestRequest, RawForm } from "@/domain/requests/parse";
import type { RequestTarget } from "@/domain/requests/target";

import type { EmailSenderPort } from "../integrations/ports";
import { EmailSendError } from "../integrations/resend";
import type { RequestLimits } from "./rate-limit";

// Anfrage annehmen und verschicken (ROADMAP Stufe 5, ADR 0023): prüfen, zählen, zwei E-Mails,
// nichts speichern. Gästedaten stehen danach nur noch in den beiden Postfächern.

export type SubmitDeps = {
  /** `null`, wenn der Versand nicht eingerichtet ist (RESEND_API_KEY/EMAIL_FROM fehlen). */
  readonly email: EmailSenderPort | null;
  readonly limits: RequestLimits;
  readonly now: () => Date;
  /** Meldet Störungen ohne personenbezogene Daten (nur Seite, Art, Fehlerart, HTTP-Status). */
  readonly report?: (event: RequestIncident) => void;
};

export type RequestIncident = {
  readonly site: string;
  readonly kind: RequestKind;
  readonly incident: "notConfigured" | "businessMailFailed" | "guestMailFailed";
  readonly error?: { readonly kind: string; readonly status: number | null };
};

export type SubmitInput = {
  readonly target: RequestTarget;
  readonly kind: RequestKind;
  readonly form: RawForm;
  /** Absender-Kennung fürs Rate-Limit (IP); `null`, wenn unbekannt. */
  readonly client: string | null;
};

const callHint = (target: RequestTarget) => (target.phone ? ` Bitte rufen Sie an: ${target.phone.display}.` : "");

function limited(retryAfterSeconds: number, target: RequestTarget): RequestResponse {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return {
    status: "limited",
    retryAfterSeconds,
    message: `Gerade kommen zu viele Anfragen an. Bitte versuchen Sie es in ${minutes === 1 ? "einer Minute" : `${minutes} Minuten`} noch einmal.${callHint(target)}`,
  };
}

/**
 * Gleiche Anfrage → gleicher Schlüssel. Ein doppelter Klick oder ein wiederholter Versand erzeugt so
 * bei Resend keine zweite E-Mail (24 Stunden lang).
 */
export function idempotencyBase(siteId: string, request: GuestRequest): string {
  return createHash("sha256").update(JSON.stringify([siteId, request])).digest("hex").slice(0, 40);
}

async function deliver(sender: EmailSenderPort, mail: RequestMail, key: string): Promise<"sent" | EmailSendError> {
  try {
    await sender.send({ fromName: mail.senderName, to: [mail.to], replyTo: mail.replyTo, subject: mail.subject, text: mail.text, idempotencyKey: key });
    return "sent";
  } catch (error) {
    const failure = error instanceof EmailSendError ? error : new EmailSendError("unavailable", null);
    // Schon unterwegs (gleicher Schlüssel): die erste Anfrage stellt zu – für den Gast ist das Erfolg.
    return failure.kind === "duplicate" ? "sent" : failure;
  }
}

export async function submitRequest(input: SubmitInput, deps: SubmitDeps): Promise<RequestResponse> {
  const { target, kind } = input;

  if (input.client !== null) {
    const decision = deps.limits.client.hit(input.client);
    if (!decision.allowed) return limited(decision.retryAfterSeconds, target);
  }

  const evaluation = evaluateRequest(kind, input.form, target, deps.now());
  switch (evaluation.kind) {
    case "drop":
      // Ein Bot soll nicht lernen, dass er erkannt wurde.
      return { status: "sent", confirmation: "sent" };
    case "retry":
      return { status: "invalid", message: RETRY_MESSAGE, fieldErrors: {} };
    case "notOffered":
      return { status: "unavailable", message: `${kind === "table" ? "Tischanfragen" : "Abhol-Bestellungen"} nimmt das Haus online nicht an.${callHint(target)}` };
    case "invalid":
      return { status: "invalid", message: INVALID_MESSAGE, fieldErrors: evaluation.errors };
    case "ok":
      break;
  }
  const { request } = evaluation;

  if (!deps.email) {
    deps.report?.({ site: target.siteId, kind, incident: "notConfigured" });
    return { status: "unavailable", message: `Anfragen per E-Mail sind gerade nicht eingerichtet.${callHint(target)}` };
  }

  // Erst nach der Prüfung zählen: Wer Eingabefehler korrigiert, verbraucht kein Kontingent.
  for (const [limiter, key] of [
    [deps.limits.guest, request.email.toLowerCase()],
    [deps.limits.site, target.siteId],
  ] as const) {
    const decision = limiter.hit(key);
    if (!decision.allowed) return limited(decision.retryAfterSeconds, target);
  }

  const base = idempotencyBase(target.siteId, request);
  const business = await deliver(deps.email, businessMail(request, target), `anfrage-${base}-betrieb`);
  if (business !== "sent") {
    deps.report?.({ site: target.siteId, kind, incident: "businessMailFailed", error: { kind: business.kind, status: business.status } });
    return { status: "failed", message: `Die Anfrage ließ sich gerade nicht verschicken.${callHint(target) || " Bitte versuchen Sie es später noch einmal."}` };
  }

  const guest = await deliver(deps.email, guestMail(request, target), `anfrage-${base}-gast`);
  if (guest !== "sent") {
    deps.report?.({ site: target.siteId, kind, incident: "guestMailFailed", error: { kind: guest.kind, status: guest.status } });
    return { status: "sent", confirmation: "failed" };
  }
  return { status: "sent", confirmation: "sent" };
}
