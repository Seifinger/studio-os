import { z } from "zod";

import { contrastRatio } from "@/domain/color/contrast";
import { FONT_IDS, fontById, hasItalic } from "@/domain/design/fonts";
import { checkCopy } from "@/domain/quality/copy-rules";

import { NARRATIVE_SECTIONS } from "../composition/sections";
import { motionProfileSchema } from "../motion/narrative-editorial";

// Theme-Schema der erzählenden Komposition (ADR 0022). Ein Theme ist vollständig oder ungültig:
// Farben, Schriftrollen, Abstände, Container, Hero, Navigation, CTA, Karte, Geschichte, Galerie,
// Abschluss, mobile Regeln, Barrierefreiheit, Bewegung und Bildsprache.

const hex = z.string().regex(/^#[0-9a-f]{6}$/i, { error: "Farbe als #rrggbb" });
const cssSize = z.string().regex(/^(?:clamp|min|max)\(.+\)$|^\d+(?:\.\d+)?(?:rem|px)$/, { error: "CSS-Größe (rem, px oder clamp())" });
const rem = z.number().positive().max(20);
export const RATIOS = ["21:9", "16:9", "3:2", "4:5", "1:1", "2:3"] as const;
const ratio = z.enum(RATIOS);

const typeRole = z.object({
  font: z.enum(FONT_IDS),
  weight: z.number().int().min(100).max(900),
  italic: z.boolean(),
  /** Laufweite in em; Versalien brauchen Luft, Fließtext nicht. */
  tracking: z.number().min(-0.05).max(0.2),
  case: z.enum(["normal", "uppercase"]),
  lineHeight: z.number().min(0.8).max(1.9),
});
export type TypeRole = z.infer<typeof typeRole>;

export const NAV_TARGETS = ["story", "menu", "atmosphere", "visit", "reservation"] as const;

const imagePlacement = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  section: z.enum(NARRATIVE_SECTIONS),
  role: z.enum(["beweis", "stimmung", "orientierung"]),
  subjectKind: z.enum(["gericht", "raum", "team", "haus", "detail", "umgebung"]),
  /** Motiv als Satz; {name} und {dish} werden beim Briefing ersetzt. */
  subject: z.string().trim().min(12).max(220),
  ratio: z.object({ desktop: ratio, mobile: ratio }),
});

export const themeSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(3).max(60),
  /** Ein Satz, wofür das Theme steht (keine Adjektivkette, T2). */
  description: z.string().trim().min(20).max(240),
  basedOn: z.string().nullable(),
  colors: z.object({
    paper: hex,
    paperRaised: hex,
    ink: hex,
    inkMuted: hex,
    line: hex,
    night: hex,
    nightInk: hex,
    nightMuted: hex,
    primary: hex,
    onPrimary: hex,
    nightPrimary: hex,
    onNightPrimary: hex,
    accent: hex,
    focus: hex,
  }),
  typography: z.object({
    display: typeRole,
    text: typeRole,
    label: typeRole,
    caption: typeRole,
    scale: z.object({ hero: cssSize, claim: cssSize, h2: cssSize, h3: cssSize, lead: cssSize, body: cssSize, small: cssSize }),
  }),
  spacing: z.object({
    steps: z.object({ xs: rem, s: rem, m: rem, l: rem, xl: rem, xxl: rem }),
    section: z.object({ mobile: rem, desktop: rem }),
    /** Abstand bei einem Aktwechsel (dunkel ↔ hell) – größer als zwischen Abschnitten. */
    act: z.object({ mobile: rem, desktop: rem }),
  }),
  container: z.object({
    textMaxCh: z.number().int().min(45).max(75),
    wideMaxRem: z.number().min(48).max(96),
    gutter: z.object({ mobile: z.number().min(1).max(2.5), desktop: z.number().min(1.5).max(6) }),
    bleedImages: z.boolean(),
  }),
  hero: z.object({
    variant: z.enum(["night-type", "night-image", "paper-type"]),
    height: z.enum(["screen", "tall", "content"]),
    align: z.enum(["bottom", "center"]),
    actions: z.union([z.literal(1), z.literal(2)]),
    kicker: z.enum(["cuisine-locality", "locality", "none"]),
  }),
  navigation: z.object({
    items: z.array(z.enum(NAV_TARGETS)).min(2).max(5),
    sticky: z.boolean(),
    headerCta: z.boolean(),
    mobile: z.literal("sheet"),
  }),
  cta: z.object({
    primaryStyle: z.enum(["filled", "outline"]),
    secondaryStyle: z.enum(["outline", "text"]),
    radius: z.enum(["none", "soft", "round"]),
    mobileBar: z.boolean(),
    minTargetPx: z.number().int().min(44).max(64),
  }),
  menu: z.object({
    layout: z.enum(["ledger", "chapters", "cards"]),
    categoryNav: z.enum(["scroll-row", "list"]),
    allergens: z.enum(["inline", "footnote"]),
    leaders: z.boolean(),
  }),
  story: z.object({
    layout: z.enum(["chapters", "single"]),
    lead: z.enum(["large", "normal"]),
    imageRhythm: z.enum(["alternate", "stack"]),
    captions: z.enum(["italic", "label"]),
  }),
  gallery: z.object({ layout: z.enum(["scroll-row", "stack"]), ratio, captions: z.boolean() }),
  closing: z.object({ act: z.enum(["night", "paper"]), showHours: z.boolean(), showAddress: z.boolean() }),
  mobile: z.object({
    singleColumnBelowRem: z.number().min(40).max(64),
    stickyActionBar: z.boolean(),
    oneIdeaPerScreen: z.boolean(),
    maxLineCh: z.number().int().min(30).max(45),
  }),
  accessibility: z.object({
    minTextContrast: z.number().min(4.5),
    minNonTextContrast: z.number().min(3),
    focusRingPx: z.number().min(2).max(4),
    skipLink: z.literal(true),
    respectReducedMotion: z.literal(true),
  }),
  motion: motionProfileSchema,
  imagery: z.object({
    language: z.string().trim().min(20).max(300),
    light: z.string().trim().min(10).max(200),
    colorWorld: z.array(z.string().trim().min(3)).min(2).max(6),
    avoid: z.array(z.string().trim().min(3)).min(3),
    placements: z.array(imagePlacement).min(3),
  }),
});

export type Theme = z.infer<typeof themeSchema>;
export type ImagePlacement = z.infer<typeof imagePlacement>;

/** Was das Schema allein nicht prüfen kann. Leere Liste = Theme darf verwendet werden. */
export function themeProblems(theme: Theme): string[] {
  const problems: string[] = [];
  const { colors: c, accessibility: a } = theme;
  const pairs: readonly (readonly [string, string, number, string])[] = [
    [c.ink, c.paper, a.minTextContrast, "Text auf Papier"],
    [c.ink, c.paperRaised, a.minTextContrast, "Text auf erhöhter Fläche"],
    [c.inkMuted, c.paper, a.minTextContrast, "Nebentext auf Papier"],
    [c.inkMuted, c.paperRaised, a.minTextContrast, "Nebentext auf erhöhter Fläche"],
    [c.nightInk, c.night, a.minTextContrast, "Text auf Nacht"],
    [c.nightMuted, c.night, a.minTextContrast, "Nebentext auf Nacht"],
    [c.primary, c.paper, a.minTextContrast, "Links und Knopfkante auf Papier"],
    [c.onPrimary, c.primary, a.minTextContrast, "Schrift auf Primärknopf"],
    [c.onNightPrimary, c.nightPrimary, a.minTextContrast, "Schrift auf Primärknopf (Nacht)"],
    [c.nightPrimary, c.night, a.minNonTextContrast, "Primärknopf auf Nacht"],
    [c.accent, c.paper, a.minNonTextContrast, "Signal auf Papier"],
    [c.focus, c.paper, a.minNonTextContrast, "Fokusring auf Papier"],
    [c.focus, c.night, a.minNonTextContrast, "Fokusring auf Nacht"],
  ];
  for (const [fg, bg, minimum, task] of pairs) {
    const ratio = contrastRatio(fg, bg);
    if (ratio < minimum) problems.push(`${task}: ${ratio.toFixed(2)}:1 < ${minimum}:1`);
  }

  const roles = Object.entries(theme.typography).filter(([key]) => key !== "scale") as [string, TypeRole][];
  for (const [name, role] of roles) {
    const font = fontById(role.font);
    if (!font.weights.includes(role.weight)) problems.push(`Schriftrolle ${name}: ${font.family} ${role.weight} ist nicht im Register`);
    if (role.italic && !hasItalic(role.font, role.weight)) problems.push(`Schriftrolle ${name}: ${font.family} hat keine echte Kursive ${role.weight}`);
    if (role.case === "uppercase" && role.tracking < 0.04) problems.push(`Schriftrolle ${name}: Versalien brauchen mindestens 0,04 em Laufweite`);
  }
  const families = new Set(roles.map(([, role]) => role.font));
  if (families.size > 3) problems.push(`${families.size} Schriftfamilien – höchstens drei (Performance, eine Stimme)`);

  const sections = new Set(theme.imagery.placements.map((placement) => placement.section));
  if (!sections.has("hero") && theme.hero.variant === "night-image") problems.push("Hero mit Bild braucht einen Bildplatz im Hero");
  const ids = theme.imagery.placements.map((placement) => placement.id);
  if (new Set(ids).size !== ids.length) problems.push("Bildplatz-IDs doppelt");

  for (const text of [theme.description, theme.imagery.language]) {
    for (const finding of checkCopy(text)) if (finding.severity === "fehler") problems.push(`Floskel: „${finding.match.trim()}“`);
  }
  return problems;
}

type DeepPartial<T> = T extends readonly unknown[] ? T : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;
export type ThemePatch = DeepPartial<Omit<Theme, "id" | "name" | "description" | "basedOn">> & Pick<Theme, "id" | "name" | "description">;

function merge(base: unknown, patch: unknown): unknown {
  if (patch === undefined) return base;
  if (Array.isArray(patch) || typeof patch !== "object" || patch === null) return patch;
  if (typeof base !== "object" || base === null || Array.isArray(base)) return patch;
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(patch)) result[key] = merge(result[key], value);
  return result;
}

/** Leitet ein Theme ab: Objekte werden verschmolzen, Listen ersetzt; das Ergebnis wird vollständig geprüft. */
export function extendTheme(base: Theme, patch: ThemePatch): Theme {
  return themeSchema.parse({ ...(merge(base, patch) as object), basedOn: base.id });
}
