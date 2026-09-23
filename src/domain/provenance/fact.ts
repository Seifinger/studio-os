import { z } from "zod";

// Provenienzmodell (ADR 0015): Jede Angabe über einen Betrieb trägt ihre Herkunft.
// Neu geschrieben nach gastro-webagentur v2/briefing/briefing.js (vier Status, Quelle) und
// gastro-v3 src/briefing/validator.js (leere Werte sind nie bestätigt).

/** Status-Werte bleiben deutsch, weil sie im Gespräch mit Kunden so heißen (ADR 0008). */
export const FACT_STATUSES = ["bestaetigt", "uebernommen", "vorschlag", "unbekannt", "fiktiv"] as const;
export type FactStatus = (typeof FACT_STATUSES)[number];

/**
 * Speicherbare Quellen. Google Places ist bewusst keine: Außer der Place-ID dürfen
 * Places-Inhalte nicht gespeichert werden (ADR 0013).
 */
export const SOURCE_KINDS = [
  "business", // Gespräch, Mail, Freigabe durch den Betrieb
  "businessWebsite", // eigene Website des Betriebs
  "onSite", // Aushang, Schild, Speisekarte vor Ort
  "publicRegister", // Impressum, Handelsregister o. Ä.
  "studioResearch", // sonstige eigene Recherche mit Nachweis
] as const;
export type SourceKind = (typeof SOURCE_KINDS)[number];

const GOOGLE_HOST = /(^|\.)(google\.[a-z]{2,3}(\.[a-z]{2})?|goo\.gl|g\.page|googleusercontent\.com|gstatic\.com)$/i;

/** Links auf Google Maps/Places und Google-Inhalte sind keine speicherbare Quelle. */
export function isGoogleUrl(url: string): boolean {
  try {
    return GOOGLE_HOST.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

export const sourceSchema = z
  .object({
    kind: z.enum(SOURCE_KINDS, {
      error: "unbekannte Quelle – Google Places ist keine speicherbare Quelle (ADR 0013)",
    }),
    url: z.url({ protocol: /^https?$/, error: "muss eine http(s)-URL sein" }).optional(),
    note: z.string().trim().min(1).max(500).optional(),
  })
  .superRefine((source, ctx) => {
    if (source.url !== undefined && isGoogleUrl(source.url)) {
      ctx.addIssue({
        code: "custom",
        path: ["url"],
        message: "Google-Inhalte sind keine speicherbare Quelle (ADR 0013)",
      });
    }
    if (source.kind === "businessWebsite" && source.url === undefined) {
      ctx.addIssue({ code: "custom", path: ["url"], message: "Website des Betriebs braucht die URL" });
    }
    if (source.url === undefined && source.note === undefined) {
      ctx.addIssue({ code: "custom", path: ["note"], message: "Quelle braucht eine URL oder eine Notiz" });
    }
  });

export type Source = z.infer<typeof sourceSchema>;

const recordedAt = z.iso.date({ error: "Datum im Format JJJJ-MM-TT" });

export type Fact<T> =
  | { readonly status: "bestaetigt"; readonly value: T; readonly source: Source; readonly recordedAt: string }
  | { readonly status: "uebernommen"; readonly value: T; readonly source: Source; readonly recordedAt: string }
  | { readonly status: "vorschlag"; readonly value: T; readonly by: "studio" | "ki"; readonly note?: string | undefined }
  | { readonly status: "unbekannt"; readonly value: null }
  | { readonly status: "fiktiv"; readonly value: T };

export const UNKNOWN: Fact<never> = Object.freeze({ status: "unbekannt", value: null });

function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * Schema für eine Angabe mit Herkunft. Ein leerer Wert ist nie eine Angabe –
 * dafür gibt es den Status „unbekannt“. Fehlt das Feld ganz, gilt es als unbekannt.
 */
export function factSchema<T extends z.ZodType>(value: T) {
  return z
    .discriminatedUnion("status", [
      z.object({ status: z.literal("bestaetigt"), value, source: sourceSchema, recordedAt }),
      z.object({ status: z.literal("uebernommen"), value, source: sourceSchema, recordedAt }),
      z.object({
        status: z.literal("vorschlag"),
        value,
        by: z.enum(["studio", "ki"]),
        note: z.string().trim().min(1).max(500).optional(),
      }),
      z.object({ status: z.literal("unbekannt"), value: z.null({ error: "„unbekannt“ trägt keinen Wert" }) }),
      z.object({ status: z.literal("fiktiv"), value }),
    ])
    // Breiter Parametertyp: Bei generischem T kann TypeScript `value` im Union-Typ nicht auflösen.
    .superRefine((fact: { readonly status: FactStatus; readonly value?: unknown }, ctx) => {
      if (fact.status !== "unbekannt" && isEmptyValue(fact.value)) {
        ctx.addIssue({
          code: "custom",
          path: ["value"],
          message: "Leerer Wert – dafür den Status „unbekannt“ verwenden",
        });
      }
    })
    .default(UNKNOWN);
}

/** Darf als Tatsache über einen echten Betrieb gelten. */
export function isEstablished<T>(fact: Fact<T>): fact is Extract<Fact<T>, { status: "bestaetigt" | "uebernommen" }> {
  return fact.status === "bestaetigt" || fact.status === "uebernommen";
}
