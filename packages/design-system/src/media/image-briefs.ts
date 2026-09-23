import { z } from "zod";

import { NARRATIVE_SECTIONS } from "../composition/sections";
import type { ImagePlacement, Theme } from "../themes/schema";
import { RATIOS } from "../themes/schema";

// Bildbriefings (ADR 0022): Für jeden Bildplatz eines Themes entsteht ein Auftrag für Fotograf,
// Betrieb oder Moodboard – mit Zweck, Format, Position, Bildsprache, Licht, Farbwelt, Motiv,
// Ausschlüssen und Alt-Text-Absicht. Ein Briefing ist nie ein Bild: Solange kein eigenes Foto
// freigegeben ist, zeigt die Seite den Bildplatz (DESIGN.md §5, S10).

const PURPOSE: Readonly<Record<ImagePlacement["role"], string>> = {
  beweis: "Belegt, was der Text behauptet – ein echter Handgriff, ein echtes Gericht, echte Menschen.",
  stimmung: "Gibt dem Abschnitt Raum und Licht, ohne etwas zu behaupten, das nicht stimmt.",
  orientierung: "Hilft, den Ort zu finden und wiederzuerkennen.",
};

const POSITION: Readonly<Record<(typeof NARRATIVE_SECTIONS)[number], string>> = {
  hero: "Eingang, erster Bildschirm – hinter oder neben dem Namen",
  claim: "neben der Behauptung des Hauses",
  story: "im Erzählteil, zwischen zwei Absätzen",
  craft: "im Handwerksteil, neben dem Gericht",
  menu: "am Einstieg in die Karte",
  atmosphere: "in der Bildreihe zum Raum",
  reservation: "neben der Tischanfrage",
  visit: "bei Adresse und Öffnungszeiten",
  closing: "im Abschluss vor der letzten Einladung",
};

const ALT_INTENT: Readonly<Record<ImagePlacement["subjectKind"], string>> = {
  gericht: "Name des Gerichts und was man sieht (Teller, Beilagen) – keine Wertung wie „lecker“.",
  raum: "Welcher Raum, welche Tageszeit, was darin geschieht.",
  team: "Wer (Rolle, nicht Name, wenn keine Einwilligung) und welcher Handgriff.",
  haus: "Welcher Eingang oder welche Fassade, damit man das Haus wiedererkennt.",
  detail: "Welcher Gegenstand oder Handgriff im Detail.",
  umgebung: "Welche Straße oder welcher Ort vor dem Haus.",
};

/** Gerichte nie als KI-Bild; Haus, Team und Raum nur echt (S10). KI höchstens für ein internes Moodboard. */
const AI_POLICY = "moodboard-only" as const;

export const imageBriefSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  themeId: z.string(),
  purpose: z.string().min(20),
  format: z.object({ desktop: z.enum(RATIOS), mobile: z.enum(RATIOS), minWidthPx: z.number().int().min(800) }),
  position: z.object({ section: z.enum(NARRATIVE_SECTIONS), description: z.string().min(8) }),
  visualLanguage: z.string().min(20),
  light: z.string().min(10),
  colorWorld: z.array(z.string()).min(2),
  subject: z.string().min(12),
  subjectKind: z.enum(["gericht", "raum", "team", "haus", "detail", "umgebung"]),
  role: z.enum(["beweis", "stimmung", "orientierung"]),
  exclusions: z.array(z.string()).min(3),
  altTextIntent: z.string().min(12),
  aiPolicy: z.literal(AI_POLICY),
});
export type ImageBrief = z.infer<typeof imageBriefSchema>;

export type BriefContext = {
  /** Name des Hauses, wie er auf der Seite steht. */
  readonly name: string;
  /** Hausgericht für Gerichtsplätze; ohne Gericht wird der Platz neutral beschrieben. */
  readonly signatureDish?: string | undefined;
};

function fill(template: string, context: BriefContext): string {
  return template.replaceAll("{name}", context.name).replaceAll("{dish}", context.signatureDish ?? "Das Hausgericht");
}

export function imageBriefsFor(theme: Theme, context: BriefContext): ImageBrief[] {
  const { imagery } = theme;
  return imagery.placements.map((placement) =>
    imageBriefSchema.parse({
      id: placement.id,
      themeId: theme.id,
      purpose: PURPOSE[placement.role],
      format: { desktop: placement.ratio.desktop, mobile: placement.ratio.mobile, minWidthPx: placement.section === "hero" ? 2400 : 1600 },
      position: { section: placement.section, description: POSITION[placement.section] },
      visualLanguage: imagery.language,
      light: imagery.light,
      colorWorld: [...imagery.colorWorld],
      subject: fill(placement.subject, context),
      subjectKind: placement.subjectKind,
      role: placement.role,
      exclusions: [...imagery.avoid, "Text, Wasserzeichen oder Logos im Bild", "Gesichter erkennbarer Gäste ohne Einwilligung"],
      altTextIntent: ALT_INTENT[placement.subjectKind],
      aiPolicy: AI_POLICY,
    }),
  );
}

export function briefsForSection(briefs: readonly ImageBrief[], section: ImageBrief["position"]["section"]): ImageBrief[] {
  return briefs.filter((brief) => brief.position.section === section);
}
