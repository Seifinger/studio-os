import { DURATION_FIELD, HONEYPOT_FIELD } from "./fields";
import type { FieldErrors, GuestRequest, RawForm } from "./parse";

// Spam-Schutz ohne Drittanbieter (kein Captcha, keine Cookies, ADR 0023). Drei leise Signale, dazu
// das Rate-Limit im Server. Kein Signal darf einen echten Gast endgültig aussperren.

/** Schneller füllt kein Mensch Datum, Uhrzeit und Personen aus – auch nicht mit Autofill. */
export const MIN_FILL_MS = 2500;

export type SpamVerdict =
  | { readonly kind: "clean" }
  /** Honigtopf gefüllt: so tun, als sei alles angekommen, aber nichts verschicken. */
  | { readonly kind: "drop" }
  /** Verdächtig schnell: freundlich um erneutes Absenden bitten – ein Mensch schafft das, ein Bot selten. */
  | { readonly kind: "retry" };

export function spamVerdict(raw: RawForm): SpamVerdict {
  if ((raw[HONEYPOT_FIELD] ?? "").trim() !== "") return { kind: "drop" };
  // Ohne JavaScript fehlt die Dauer – das ist kein Verdacht, sondern ein älterer Browser.
  const duration = raw[DURATION_FIELD];
  if (duration !== undefined && duration.trim() !== "") {
    const ms = Number(duration);
    if (!Number.isFinite(ms) || ms < MIN_FILL_MS) return { kind: "retry" };
  }
  return { kind: "clean" };
}

const LINK = /https?:\/\/|www\.|\[url|<a\s/i;

/** Links in Freitexten sind fast immer Werbung. Der Gast kann sie entfernen und erneut senden. */
export function linkErrors(request: GuestRequest): FieldErrors {
  const errors: FieldErrors = {};
  if (LINK.test(request.name)) errors.name = "Bitte ohne Links.";
  if (request.kind === "table" && request.note && LINK.test(request.note)) errors.nachricht = "Bitte ohne Links – schreiben Sie es einfach in Worten.";
  if (request.kind === "pickup" && LINK.test(request.order)) errors.bestellung = "Bitte ohne Links – schreiben Sie es einfach in Worten.";
  return errors;
}
