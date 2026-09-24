import { z } from "zod";

import { type Act, ACTS, NARRATIVE_SECTIONS, type NarrativeSectionKind, SECTION_ANCHORS } from "./sections";

// Standard-Komposition „narrative-editorial“ (ADR 0022): die Abfolge der Seite als Daten.
// Pro Kunde konfigurierbar (Reihenfolge, Akt, Überschrift, Weglassen); die Regeln sichern nur,
// was jede erzählende Seite braucht: Eingang zuerst, Abschluss zuletzt, Anfahrt immer, und die
// primäre Handlung hat ein Ziel.

export { NARRATIVE_SECTIONS, SECTION_ANCHORS };
export type { Act, NarrativeSectionKind };

const stepSchema = z.object({
  kind: z.enum(NARRATIVE_SECTIONS),
  act: z.enum(ACTS),
  /** Eigene Überschrift statt der Standardüberschrift (DESIGN.md T4). */
  title: z.string().trim().min(2).max(70).optional(),
  /** Warum steht der Abschnitt hier? Pflicht – die Reihenfolge ist eine Designentscheidung. */
  why: z.string().trim().min(8).max(200),
});
export type NarrativeStep = z.infer<typeof stepSchema>;

export const PRIMARY_ACTIONS = ["tableRequest", "pickupRequest", "onlineBooking", "call"] as const;
export const SECONDARY_ACTIONS = ["menu", "directions", "call"] as const;

export const narrativeConfigSchema = z
  .object({
    sequence: z.array(stepSchema).min(5),
    primaryAction: z.enum(PRIMARY_ACTIONS),
    secondaryAction: z.enum(SECONDARY_ACTIONS),
  })
  .superRefine((config, ctx) => {
    const kinds = config.sequence.map((step) => step.kind);
    if (kinds[0] !== "hero") ctx.addIssue({ code: "custom", path: ["sequence", 0], message: "Die Seite beginnt mit dem Eingang (hero)" });
    if (kinds.at(-1) !== "closing") ctx.addIssue({ code: "custom", path: ["sequence"], message: "Die Seite endet mit dem Abschluss (closing)" });
    if (new Set(kinds).size !== kinds.length) ctx.addIssue({ code: "custom", path: ["sequence"], message: "Abschnitt doppelt" });
    if (!kinds.includes("visit")) ctx.addIssue({ code: "custom", path: ["sequence"], message: "Standort und Öffnungszeiten (visit) fehlen" });
    const needsForm = config.primaryAction === "tableRequest" || config.primaryAction === "pickupRequest";
    if (needsForm && !kinds.includes("reservation")) {
      ctx.addIssue({ code: "custom", path: ["primaryAction"], message: "Die primäre Handlung braucht den Abschnitt reservation als Ziel" });
    }
    if (config.secondaryAction === "menu" && !kinds.includes("menu")) {
      ctx.addIssue({ code: "custom", path: ["secondaryAction"], message: "Die Karte als zweiter Weg braucht den Abschnitt menu" });
    }
  });
export type NarrativeConfig = z.infer<typeof narrativeConfigSchema>;

/** Die Standard-Dramaturgie: Ankommen (Nacht) → Erzählen und Wählen (Papier) → Abschied (Nacht). */
export const DEFAULT_NARRATIVE_SEQUENCE: readonly NarrativeStep[] = [
  { kind: "hero", act: "night", why: "Ankommen: ein Ort und ein Satz, bevor Informationen kommen." },
  { kind: "claim", act: "paper", why: "Die Behauptung des Hauses in einem Satz – der Kontrastwechsel öffnet die Erzählung." },
  { kind: "story", act: "paper", why: "Menschen und Herkunft zuerst; sie machen die Karte glaubwürdig." },
  { kind: "craft", act: "paper", why: "Ein Gericht oder ein Handgriff als Beleg für die Geschichte." },
  { kind: "menu", act: "paper", why: "Die Karte als Beleg, nach Kategorien erreichbar." },
  { kind: "atmosphere", act: "night", why: "Der Raum am Abend – ein zweiter dunkler Moment vor der Entscheidung." },
  { kind: "reservation", act: "paper", why: "Die Handlung dort, wo die Entscheidung fällt." },
  { kind: "visit", act: "paper", why: "Wo und wann – knapp, vollständig, ohne Umweg." },
  { kind: "closing", act: "night", why: "Abschied mit einer letzten, klaren Einladung." },
];

/** Welche Abschnitte Inhalt haben. Eingang, Anfahrt und Abschluss stehen immer. */
export type NarrativeContent = Readonly<Partial<Record<NarrativeSectionKind, boolean>>>;

export type ResolvedStep = NarrativeStep & {
  readonly anchor: string;
  readonly index: number;
  /** Beginnt hier ein neuer Akt (Kontrastwechsel)? */
  readonly actChange: boolean;
};

export type ComposedNarrative = {
  readonly steps: readonly ResolvedStep[];
  readonly dropped: readonly { readonly kind: NarrativeSectionKind; readonly reason: string }[];
};

const ALWAYS: ReadonlySet<NarrativeSectionKind> = new Set(["hero", "visit", "closing"]);

export function composeNarrative(config: NarrativeConfig, content: NarrativeContent): ComposedNarrative {
  const parsed = narrativeConfigSchema.parse(config);
  const dropped: { kind: NarrativeSectionKind; reason: string }[] = [];
  const kept = parsed.sequence.filter((step) => {
    if (ALWAYS.has(step.kind)) return true;
    if (step.kind === "reservation") {
      const formTarget = parsed.primaryAction === "tableRequest" || parsed.primaryAction === "pickupRequest";
      if (!formTarget) dropped.push({ kind: step.kind, reason: "Primäre Handlung ist kein Formular" });
      return formTarget;
    }
    if (content[step.kind]) return true;
    dropped.push({ kind: step.kind, reason: "Kein Inhalt – ein leerer Abschnitt wäre Dekoration" });
    return false;
  });
  const steps = kept.map((step, index) => ({
    ...step,
    anchor: SECTION_ANCHORS[step.kind],
    index,
    actChange: index > 0 && kept[index - 1]?.act !== step.act,
  }));
  return { steps, dropped };
}
