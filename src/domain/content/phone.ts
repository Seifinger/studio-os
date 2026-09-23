import { z } from "zod";

// Telefonnummern werden als E.164 gespeichert (für tel:- und WhatsApp-Links) und zusätzlich
// so, wie der Betrieb sie schreibt (für die Anzeige). Ohne Ländervorwahl gilt Deutschland.

export const e164Schema = z.string().regex(/^\+[1-9]\d{7,14}$/, { error: "keine gültige internationale Nummer" });

export const phoneNumberSchema = z.object({
  e164: e164Schema,
  display: z.string().trim().min(1).max(40),
});

export type PhoneNumber = z.infer<typeof phoneNumberSchema>;

export type PhoneParseResult =
  | { readonly ok: true; readonly phone: PhoneNumber }
  | { readonly ok: false; readonly reason: string };

const ALLOWED = /^[+\d\s/().-]+$/;

/**
 * "08631 12345", "+49 (0) 8631 / 12345", "0049 8631 12345" → +49863112345.
 * Nummern ohne führende 0, + oder 00 sind mehrdeutig (Ortsvorwahl fehlt) und werden abgelehnt.
 */
export function parsePhoneNumber(input: string, defaultCountryCode = "49"): PhoneParseResult {
  const display = input.trim().replace(/\s+/g, " ");
  if (display === "" || !ALLOWED.test(display)) {
    return { ok: false, reason: "Nur Ziffern, Leerzeichen und + / ( ) - . erlaubt" };
  }

  // "(0)" nach der Ländervorwahl ist eine verbreitete, aber falsche Schreibweise.
  const compact = display.replace(/\(0\)/g, "").replace(/[\s/().-]/g, "");
  let digits: string;
  if (compact.startsWith("+")) digits = compact.slice(1);
  else if (compact.startsWith("00")) digits = compact.slice(2);
  else if (compact.startsWith("0")) digits = defaultCountryCode + compact.slice(1);
  else return { ok: false, reason: "Vorwahl fehlt (mit 0 oder +49 beginnen)" };

  if (!/^\d+$/.test(digits)) return { ok: false, reason: "+ ist nur am Anfang erlaubt" };

  const e164 = `+${digits}`;
  if (!e164Schema.safeParse(e164).success) {
    return { ok: false, reason: "Nummer ist zu kurz oder zu lang" };
  }
  return { ok: true, phone: { e164, display } };
}

export function telHref(phone: PhoneNumber): string {
  return `tel:${phone.e164}`;
}

export function whatsAppHref(phone: PhoneNumber): string {
  return `https://wa.me/${phone.e164.slice(1)}`;
}
