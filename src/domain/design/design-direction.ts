import { z } from "zod";

import { contrastRatio, WCAG_AA } from "../color/contrast";
import { CUISINE_IDS } from "../gastronomy/cuisines";
import { isGoogleUrl } from "../provenance/fact";
import { checkCopy } from "../quality/copy-rules";
import { FONT_IDS } from "./fonts";

// Design Direction (DESIGN.md §10, ADR 0019): wiederverwendbare Stilrichtung – Startpunkt, keine
// Vorlage. Belegt durch Referenzen, geprüft auf Kontrast, Schriftregeln und Floskeln.

const hex = z.string().regex(/^#[0-9a-f]{6}$/i, { error: "Farbe als #rrggbb" });

export const referenceSchema = z.object({
  name: z.string().trim().min(1),
  url: z.url({ protocol: /^https$/ }).refine((url) => !isGoogleUrl(url), { error: "Google ist keine Gestaltungsreferenz" }),
  kind: z.enum(["restaurant", "design"]),
  adopted: z.array(z.string().trim().min(1)).min(1, { error: "Was wird übernommen?" }),
  rejected: z.array(z.string().trim().min(1)),
  /** Von Hand auf der Website angesehen? v2 hat 14 Refero-Einträge als ungeprüft gemeldet. */
  verified: z.boolean(),
  /** Herkunft des Eintrags, z. B. „gastro-webagentur v2/designsysteme/italienisch--trattoria.md“ */
  foundIn: z.string().trim().min(1),
});

export const paletteSchema = z.object({
  /** Seitengrund */
  background: hex,
  /** Erhöhte Fläche: Formulare, Karten, Tafeln */
  surface: hex,
  /** Fließtext und Überschriften */
  text: hex,
  /** Nebentext */
  textMuted: hex,
  /** Handlung: Knöpfe, Links, Fokus */
  primary: hex,
  /** Schrift auf `primary` */
  onPrimary: hex,
  /** Signal ohne Text: Marken, Linien mit Bedeutung */
  accent: hex,
  /** Dekorative Haarlinie – nie alleiniger Informationsträger */
  line: hex,
});
export type Palette = z.infer<typeof paletteSchema>;

export const HERO_LAYOUTS = ["split-editorial", "immersive-type", "gallery", "cinematic"] as const;
export const MENU_LAYOUTS = ["typographic", "card-minimal", "course-led"] as const;
export const GALLERY_LAYOUTS = ["full-bleed", "masonry", "horizontal-scroll", "none"] as const;

export const designDirectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(3).max(60),
  /** Ein Satz, keine Adjektivkette (T2). */
  mood: z.string().trim().min(10).max(160),
  cuisines: z.array(z.enum(CUISINE_IDS)).min(1),
  references: z.array(referenceSchema).min(2),
  typography: z.object({
    display: z.enum(FONT_IDS),
    displayWeight: z.number().int().min(100).max(900),
    body: z.enum(FONT_IDS),
    scale: z.enum(["editorial", "compact", "monumental"]),
    /** Versalien nur für kurze Labels (DESIGN.md §4). */
    labelCase: z.enum(["normal", "uppercase"]),
  }),
  palette: paletteSchema,
  shape: z.object({
    /** Radien sind Tokens mit Aufgabe (S7). */
    radius: z.enum(["none", "soft", "round"]),
  }),
  layout: z.object({
    hero: z.enum(HERO_LAYOUTS),
    menu: z.enum(MENU_LAYOUTS),
    gallery: z.enum(GALLERY_LAYOUTS),
  }),
  motion: z.object({ intensity: z.enum(["quiet", "expressive", "editorial"]) }),
});

export type DesignDirection = z.infer<typeof designDirectionSchema>;

/** Kontrastpflichten je Farbrolle (DESIGN.md §8). */
export const PALETTE_CONTRAST_RULES: readonly (readonly [keyof Palette, keyof Palette, number, string])[] = [
  ["text", "background", WCAG_AA.text, "Fließtext auf Grund"],
  ["text", "surface", WCAG_AA.text, "Fließtext auf Fläche"],
  ["textMuted", "background", WCAG_AA.text, "Nebentext auf Grund"],
  ["textMuted", "surface", WCAG_AA.text, "Nebentext auf Fläche"],
  ["primary", "background", WCAG_AA.text, "Links und Knopfkanten auf Grund"],
  ["onPrimary", "primary", WCAG_AA.text, "Schrift auf Primärknopf"],
  ["accent", "background", WCAG_AA.nonText, "Signal auf Grund"],
];

/**
 * Prüft, was das Schema allein nicht kann. Leere Liste = Direction ist verwendbar.
 * Eine Direction ohne belegte Referenzen wird nicht verwendet (DESIGN.md §10).
 */
export function directionProblems(direction: DesignDirection): string[] {
  const problems: string[] = [];

  for (const [fg, bg, minimum, task] of PALETTE_CONTRAST_RULES) {
    const ratio = contrastRatio(direction.palette[fg], direction.palette[bg]);
    if (ratio < minimum) problems.push(`${task}: ${fg}/${bg} ${ratio.toFixed(2)}:1 < ${minimum}:1`);
  }

  const kinds = new Set(direction.references.map((reference) => reference.kind));
  if (!kinds.has("restaurant")) problems.push("Mindestens eine reale Restaurant-Website als Referenz fehlt");
  if (!kinds.has("design")) problems.push("Mindestens eine Design-Referenz fehlt");

  for (const finding of checkCopy(direction.mood)) {
    if (finding.severity === "fehler") problems.push(`Stimmung enthält Floskel: „${finding.match.trim()}“`);
  }
  if (direction.typography.display === direction.typography.body && direction.typography.scale === "compact") {
    problems.push("Eine einzige Schrift in kompakter Skala trägt keine Hierarchie – Skala oder Schrift wechseln");
  }
  if (direction.layout.hero === "cinematic") {
    problems.push("„cinematic“ setzt eigenes Video- oder Fotomaterial voraus – für Directions ohne Material nicht zulässig");
  }
  return problems;
}
