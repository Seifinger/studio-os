import { z } from "zod";

import { parsePhoneNumber, type PhoneNumber } from "../content/phone";
import { normalizeDate, normalizeTime } from "./calendar";
import { FIELD_LIMITS, type FieldErrors, type FieldName, MISSING_MESSAGES, type RawForm, type RequestKind } from "./fields";

// Eingaben eines Anfrageformulars → geprüfte Anfrage oder Fehler je Feld. Formulare liefern nur
// Zeichenketten; alles wird hier normalisiert. Fehlertexte sagen, was zu tun ist, nicht was fehlt.

export type { FieldErrors, RawForm };

type Contact = {
  readonly name: string;
  readonly email: string;
  readonly phone: PhoneNumber | null;
  /** „JJJJ-MM-TT“ */
  readonly date: string;
  /** „HH:MM“ */
  readonly time: string;
};

export type TableRequest = Contact & { readonly kind: "table"; readonly partySize: number; readonly note: string | null };
export type PickupRequest = Contact & { readonly kind: "pickup"; readonly order: string };
export type GuestRequest = TableRequest | PickupRequest;

export type ParseResult = { readonly ok: true; readonly request: GuestRequest } | { readonly ok: false; readonly errors: FieldErrors };

// Steuerzeichen außer Zeilenumbruch und Tab: in E-Mail-Texten nutzlos, in Kopfzeilen gefährlich.
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Einzeilig: jeder Leerraum (auch Zeilenumbrüche) wird zu einem Leerzeichen – kein Header-Einschleusen. */
const singleLine = (value: string) => value.replace(CONTROL, "").replace(/\s+/g, " ").trim();
/** Mehrzeilig: Zeilen bleiben, Leerzeilenfolgen werden gekürzt. */
const multiLine = (value: string) =>
  value
    .replace(CONTROL, "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[^\S\n]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const emailSchema = z.email();

export function parseRequest(kind: RequestKind, raw: RawForm): ParseResult {
  const errors: FieldErrors = {};
  const missing = MISSING_MESSAGES[kind];
  const read = (field: FieldName) => raw[field] ?? "";

  const name = singleLine(read("name"));
  if (name.length < 2) errors.name = missing.name;
  else if (name.length > FIELD_LIMITS.name) errors.name = `Bitte höchstens ${FIELD_LIMITS.name} Zeichen.`;
  else if (/[<>]/.test(name)) errors.name = "Bitte nur den Namen, ohne < oder >.";

  const email = singleLine(read("email"));
  if (email === "") errors.email = missing.email;
  else if (email.length > FIELD_LIMITS.email || !emailSchema.safeParse(email).success) {
    errors.email = "Diese E-Mail-Adresse stimmt nicht – bitte prüfen (Beispiel: name@beispiel.de).";
  }

  let phone: PhoneNumber | null = null;
  const phoneInput = singleLine(read("telefon"));
  if (phoneInput !== "") {
    const parsed = phoneInput.length > FIELD_LIMITS.telefon ? null : parsePhoneNumber(phoneInput);
    if (parsed?.ok) phone = parsed.phone;
    else errors.telefon = `Diese Nummer stimmt nicht${parsed ? ` (${parsed.reason})` : ""}. Das Feld darf auch leer bleiben.`;
  }

  const date = normalizeDate(read("datum"));
  if (date === null) errors.datum = missing.datum;

  const time = normalizeTime(read("uhrzeit"));
  if (time === null) errors.uhrzeit = missing.uhrzeit;

  if (kind === "table") {
    const partyInput = read("personen").trim();
    const partySize = /^\d{1,3}$/.test(partyInput) ? Number(partyInput) : Number.NaN;
    if (!Number.isInteger(partySize) || partySize < 1) errors.personen = missing.personen;

    const note = multiLine(read("nachricht"));
    if (note.length > FIELD_LIMITS.nachricht) errors.nachricht = `Bitte höchstens ${FIELD_LIMITS.nachricht} Zeichen.`;

    if (Object.keys(errors).length > 0 || date === null || time === null) return { ok: false, errors };
    return { ok: true, request: { kind, name, email, phone, date, time, partySize, note: note === "" ? null : note } };
  }

  const order = multiLine(read("bestellung"));
  if (order.length < 3) errors.bestellung = missing.bestellung;
  else if (order.length > FIELD_LIMITS.bestellung) errors.bestellung = `Bitte höchstens ${FIELD_LIMITS.bestellung} Zeichen.`;

  if (Object.keys(errors).length > 0 || date === null || time === null) return { ok: false, errors };
  return { ok: true, request: { kind, name, email, phone, date, time, order } };
}
