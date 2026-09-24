// Felder der Anfrageformulare (ROADMAP Stufe 5, ADR 0023). Eine Beschreibung für alle: Kompositionen
// rendern daraus ihre eigene Optik, der Server prüft dieselben Namen und Grenzen. So wenige Felder wie
// möglich (DESIGN.md §6) – E-Mail ist Pflicht, weil dorthin die Eingangsbestätigung geht.

export const REQUEST_KINDS = ["table", "pickup"] as const;
export type RequestKind = (typeof REQUEST_KINDS)[number];

/** Wert des versteckten Felds `art` – deutsch, weil er in der URL-kodierten Anfrage steht. */
export const REQUEST_KIND_VALUES: Readonly<Record<RequestKind, string>> = { table: "tisch", pickup: "abholung" };

export const KIND_FIELD = "art";
/** Honigtopf: für Menschen unsichtbar, von Bots gern ausgefüllt. */
export const HONEYPOT_FIELD = "webseite";
/** Millisekunden zwischen erster Eingabe und Absenden; setzt nur das Skript im Browser. */
export const DURATION_FIELD = "dauer";

/** Größere Gruppen bitte telefonisch – eine Formularanfrage ersetzt dort kein Gespräch. */
export const MAX_PARTY_SIZE = 12;
/** Wie weit im Voraus angefragt werden kann. */
export const HORIZON_DAYS = 90;

export const FIELD_NAMES = ["name", "email", "telefon", "datum", "uhrzeit", "personen", "bestellung", "nachricht"] as const;
export type FieldName = (typeof FIELD_NAMES)[number];

/** Rohwerte eines Formulars – Browser schicken nur Zeichenketten. */
export type RawForm = Readonly<Record<string, string | undefined>>;
export type FieldErrors = Partial<Record<FieldName, string>>;

export type RequestField = {
  readonly name: FieldName;
  readonly label: string;
  readonly control: "text" | "email" | "tel" | "date" | "time" | "number" | "textarea";
  readonly required: boolean;
  /** Kurzer Hinweis unter dem Feld – sagt, wozu die Angabe dient. */
  readonly hint?: string;
  readonly autoComplete?: string;
  readonly inputMode?: "text" | "email" | "tel" | "numeric";
  readonly maxLength?: number;
  readonly min?: number;
  readonly max?: number;
  /** Nimmt im zweispaltigen Formular die volle Breite ein. */
  readonly wide: boolean;
};

export const FIELD_LIMITS = { name: 80, email: 200, telefon: 40, bestellung: 1500, nachricht: 1000 } as const;

const contact: readonly RequestField[] = [
  { name: "name", label: "Name", control: "text", required: true, autoComplete: "name", maxLength: FIELD_LIMITS.name, wide: false },
  {
    name: "email",
    label: "E-Mail",
    control: "email",
    required: true,
    hint: "Dorthin geht die Eingangsbestätigung.",
    autoComplete: "email",
    inputMode: "email",
    maxLength: FIELD_LIMITS.email,
    wide: false,
  },
  {
    name: "telefon",
    label: "Telefon (optional)",
    control: "tel",
    required: false,
    hint: "Für kurze Rückfragen.",
    autoComplete: "tel",
    inputMode: "tel",
    maxLength: FIELD_LIMITS.telefon,
    wide: false,
  },
];

export const REQUEST_FIELDS: Readonly<Record<RequestKind, readonly RequestField[]>> = {
  table: [
    ...contact,
    { name: "datum", label: "Datum", control: "date", required: true, wide: false },
    { name: "uhrzeit", label: "Uhrzeit", control: "time", required: true, wide: false },
    { name: "personen", label: "Personen", control: "number", required: true, inputMode: "numeric", min: 1, max: MAX_PARTY_SIZE, wide: false },
    { name: "nachricht", label: "Anmerkung (optional)", control: "textarea", required: false, maxLength: FIELD_LIMITS.nachricht, wide: true },
  ],
  pickup: [
    ...contact,
    { name: "datum", label: "Abholtag", control: "date", required: true, wide: false },
    { name: "uhrzeit", label: "Abholzeit", control: "time", required: true, wide: false },
    {
      name: "bestellung",
      label: "Was dürfen wir vorbereiten?",
      control: "textarea",
      required: true,
      hint: "Gerichte und Anzahl, gern mit Wünschen.",
      maxLength: FIELD_LIMITS.bestellung,
      wide: true,
    },
  ],
};

/**
 * Meldungen für leere Pflichtfelder. Dieselben Texte prüft der Browser sofort (ohne Zod, damit das
 * Formular leicht bleibt) und der Server vollständig (parse.ts).
 */
export const MISSING_MESSAGES: Readonly<Record<RequestKind, FieldErrors>> = {
  table: {
    name: "Bitte geben Sie Ihren Namen an.",
    email: "Bitte geben Sie Ihre E-Mail-Adresse an – dorthin geht die Bestätigung.",
    datum: "Bitte wählen Sie ein Datum.",
    uhrzeit: "Bitte geben Sie eine Uhrzeit an (z. B. 19:30).",
    personen: "Bitte geben Sie an, für wie viele Personen.",
  },
  pickup: {
    name: "Bitte geben Sie Ihren Namen an.",
    email: "Bitte geben Sie Ihre E-Mail-Adresse an – dorthin geht die Bestätigung.",
    datum: "Bitte wählen Sie den Abholtag.",
    uhrzeit: "Bitte geben Sie eine Abholzeit an (z. B. 12:15).",
    bestellung: "Bitte schreiben Sie, was wir vorbereiten dürfen.",
  },
};

/** Leere Pflichtfelder – die schnelle Vorprüfung im Browser. Alles Weitere prüft der Server. */
export function missingFields(kind: RequestKind, raw: RawForm): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of REQUEST_FIELDS[kind]) {
    const message = MISSING_MESSAGES[kind][field.name];
    if (field.required && message && (raw[field.name] ?? "").trim() === "") errors[field.name] = message;
  }
  return errors;
}

export const SUBMIT_LABELS: Readonly<Record<RequestKind, string>> = { table: "Anfrage senden", pickup: "Bestellung senden" };

export function requestKindFromValue(value: string | null | undefined): RequestKind | null {
  return REQUEST_KINDS.find((kind) => REQUEST_KIND_VALUES[kind] === value) ?? null;
}
