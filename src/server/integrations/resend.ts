import "server-only";

import { z } from "zod";

import type { EmailSenderPort, OutboundEmail } from "./ports";

// Adapter für Resend (ADR 0023) – bewusst ohne SDK: ein POST mit JSON reicht, `fetch` kann es schon.
// Der Schlüssel verlässt den Server nie; Fehler nennen nur Art und HTTP-Status, nie Inhalte.

export const RESEND_DEFAULT_BASE_URL = "https://api.resend.com";
const TIMEOUT_MS = 10_000;
/** Grenze von Resend für den Idempotency-Key. */
const IDEMPOTENCY_KEY = /^[A-Za-z0-9_.:-]{1,256}$/;

/**
 * - `misconfigured`: Schlüssel oder Absenderdomain stimmen nicht (401/403) – das Studio muss handeln.
 * - `rejected`: Resend lehnt die Nachricht ab (400/422), z. B. eine unzustellbare Adresse.
 * - `duplicate`: dieselbe Nachricht ist schon unterwegs oder verschickt (409, gleicher Key).
 * - `unavailable`: Netz, Zeitlimit, 429, 5xx oder unlesbare Antwort – später erneut versuchen.
 */
export type EmailErrorKind = "misconfigured" | "rejected" | "duplicate" | "unavailable";

export class EmailSendError extends Error {
  override readonly name = "EmailSendError";
  readonly kind: EmailErrorKind;
  readonly status: number | null;

  constructor(kind: EmailErrorKind, status: number | null) {
    super(`E-Mail-Versand fehlgeschlagen (${kind}${status === null ? "" : `, HTTP ${status}`})`);
    this.kind = kind;
    this.status = status;
  }
}

type Fetch = (input: string, init: RequestInit) => Promise<Response>;

export type ResendOptions = {
  readonly apiKey: string;
  /** EMAIL_FROM: „adresse@domain.de“ oder „Name <adresse@domain.de>“. */
  readonly from: string;
  readonly baseUrl?: string;
  readonly fetch?: Fetch;
};

const responseSchema = z.object({ id: z.string().min(1) });

/** Adresse aus „Name <adresse@domain.de>“ oder „adresse@domain.de“. */
export function senderAddress(from: string): string {
  const match = /<([^<>]+)>\s*$/.exec(from);
  return (match?.[1] ?? from).trim();
}

/**
 * Anzeigename + Adresse. Der Name kommt aus Betriebsdaten; Zeichen mit Bedeutung im Absenderfeld
 * (Anführungszeichen, spitze Klammern, Komma, Semikolon, Zeilenumbrüche) fallen weg.
 */
export function formatSender(name: string | undefined, from: string): string {
  const address = senderAddress(from);
  const clean = (name ?? "").replace(/["<>,;:\\@\r\n]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  return clean === "" ? from.trim() : `${clean} <${address}>`;
}

function errorKind(status: number): EmailErrorKind {
  if (status === 401 || status === 403) return "misconfigured";
  if (status === 409) return "duplicate";
  if (status === 400 || status === 422) return "rejected";
  return "unavailable";
}

export function createResendSender(options: ResendOptions): EmailSenderPort {
  const request = options.fetch ?? fetch;
  const endpoint = `${(options.baseUrl ?? RESEND_DEFAULT_BASE_URL).replace(/\/+$/, "")}/emails`;

  return {
    async send(email: OutboundEmail) {
      if (!IDEMPOTENCY_KEY.test(email.idempotencyKey)) throw new EmailSendError("rejected", null);
      if (email.to.length === 0 || email.to.length > 50) throw new EmailSendError("rejected", null);

      const body = {
        from: formatSender(email.fromName, options.from),
        to: [...email.to],
        subject: email.subject,
        text: email.text,
        ...(email.html ? { html: email.html } : {}),
        ...(email.replyTo ? { reply_to: email.replyTo } : {}),
      };

      let response: Response;
      try {
        response = await request(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${options.apiKey}`,
            "Content-Type": "application/json",
            "Idempotency-Key": email.idempotencyKey,
          },
          body: JSON.stringify(body),
          cache: "no-store",
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
      } catch {
        throw new EmailSendError("unavailable", null);
      }

      if (!response.ok) throw new EmailSendError(errorKind(response.status), response.status);
      const parsed = responseSchema.safeParse(await response.json().catch(() => null));
      if (!parsed.success) throw new EmailSendError("unavailable", response.status);
      return { messageId: parsed.data.id };
    },
  };
}
