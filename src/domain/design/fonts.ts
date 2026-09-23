import { isBannedFontFamily } from "../quality/design-rules";

// Schriftregister (DESIGN.md §4, ADR 0019): nur selbst gehostete Schriften mit belegter Lizenz.
// Quelle der Dateien sind die Fontsource-Pakete (npm), die die Google-Fonts-Dateien unter
// SIL OFL 1.1 weitergeben – ausgeliefert vom eigenen Server, nie von Google.

export type FontCategory = "serif" | "sans" | "display-serif" | "display-sans" | "condensed";

export type FontFamily = {
  readonly id: string;
  readonly family: string;
  readonly package: string;
  readonly license: "OFL-1.1";
  readonly category: FontCategory;
  /** Schnitte, die das Studio einbindet (je Schnitt eine CSS-Datei im Paket). */
  readonly weights: readonly number[];
  /** Nur lateinische Zeichensätze laden (Schriften mit sehr großen CJK-Zeichensätzen). */
  readonly latinOnly?: boolean;
};

export const FONT_FAMILIES = [
  { id: "vollkorn", family: "Vollkorn", package: "@fontsource/vollkorn", license: "OFL-1.1", category: "serif", weights: [400, 700] },
  { id: "alegreya-sans", family: "Alegreya Sans", package: "@fontsource/alegreya-sans", license: "OFL-1.1", category: "sans", weights: [400, 700] },
  { id: "cormorant-garamond", family: "Cormorant Garamond", package: "@fontsource/cormorant-garamond", license: "OFL-1.1", category: "display-serif", weights: [500, 600] },
  { id: "karla", family: "Karla", package: "@fontsource/karla", license: "OFL-1.1", category: "sans", weights: [400, 700] },
  { id: "marcellus", family: "Marcellus", package: "@fontsource/marcellus", license: "OFL-1.1", category: "display-serif", weights: [400] },
  { id: "figtree", family: "Figtree", package: "@fontsource/figtree", license: "OFL-1.1", category: "sans", weights: [400, 700] },
  { id: "bricolage-grotesque", family: "Bricolage Grotesque", package: "@fontsource/bricolage-grotesque", license: "OFL-1.1", category: "display-sans", weights: [800] },
  { id: "work-sans", family: "Work Sans", package: "@fontsource/work-sans", license: "OFL-1.1", category: "sans", weights: [400, 700] },
  { id: "reem-kufi", family: "Reem Kufi", package: "@fontsource/reem-kufi", license: "OFL-1.1", category: "display-sans", weights: [600] },
  { id: "young-serif", family: "Young Serif", package: "@fontsource/young-serif", license: "OFL-1.1", category: "display-serif", weights: [400] },
  { id: "hanken-grotesk", family: "Hanken Grotesk", package: "@fontsource/hanken-grotesk", license: "OFL-1.1", category: "sans", weights: [400, 700] },
  { id: "chivo", family: "Chivo", package: "@fontsource/chivo", license: "OFL-1.1", category: "sans", weights: [400, 800] },
  { id: "newsreader", family: "Newsreader", package: "@fontsource/newsreader", license: "OFL-1.1", category: "display-serif", weights: [500] },
  { id: "be-vietnam-pro", family: "Be Vietnam Pro", package: "@fontsource/be-vietnam-pro", license: "OFL-1.1", category: "sans", weights: [400, 700] },
  { id: "antonio", family: "Antonio", package: "@fontsource/antonio", license: "OFL-1.1", category: "condensed", weights: [700] },
  { id: "zen-kaku-gothic-new", family: "Zen Kaku Gothic New", package: "@fontsource/zen-kaku-gothic-new", license: "OFL-1.1", category: "sans", weights: [400, 700], latinOnly: true },
  { id: "rozha-one", family: "Rozha One", package: "@fontsource/rozha-one", license: "OFL-1.1", category: "display-serif", weights: [400] },
  { id: "source-serif-4", family: "Source Serif 4", package: "@fontsource/source-serif-4", license: "OFL-1.1", category: "serif", weights: [400, 700] },
  { id: "schibsted-grotesk", family: "Schibsted Grotesk", package: "@fontsource/schibsted-grotesk", license: "OFL-1.1", category: "sans", weights: [400, 800] },
  { id: "instrument-serif", family: "Instrument Serif", package: "@fontsource/instrument-serif", license: "OFL-1.1", category: "display-serif", weights: [400] },
  { id: "instrument-sans", family: "Instrument Sans", package: "@fontsource/instrument-sans", license: "OFL-1.1", category: "sans", weights: [400, 700] },
  { id: "libre-caslon-display", family: "Libre Caslon Display", package: "@fontsource/libre-caslon-display", license: "OFL-1.1", category: "display-serif", weights: [400] },
  { id: "libre-franklin", family: "Libre Franklin", package: "@fontsource/libre-franklin", license: "OFL-1.1", category: "sans", weights: [400, 700] },
  { id: "fraunces", family: "Fraunces", package: "@fontsource/fraunces", license: "OFL-1.1", category: "display-serif", weights: [600] },
] as const satisfies readonly FontFamily[];

export type FontId = (typeof FONT_FAMILIES)[number]["id"];
export const FONT_IDS = FONT_FAMILIES.map((font) => font.id) as [FontId, ...FontId[]];

const FALLBACK: Readonly<Record<FontCategory, string>> = {
  serif: 'Georgia, "Times New Roman", serif',
  "display-serif": 'Georgia, "Times New Roman", serif',
  sans: '"Helvetica Neue", Arial, sans-serif',
  "display-sans": '"Helvetica Neue", Arial, sans-serif',
  condensed: '"Arial Narrow", "Helvetica Neue", Arial, sans-serif',
};

export function fontById(id: FontId): FontFamily {
  const font = FONT_FAMILIES.find((candidate) => candidate.id === id);
  if (!font) throw new Error(`Unbekannte Schrift: ${id}`);
  return font;
}

/** CSS-Schriftstapel mit metrisch ähnlicher Systemschrift als Rückfall. */
export function fontStack(id: FontId): string {
  const font = fontById(id);
  return `"${font.family}", ${FALLBACK[font.category]}`;
}

/** Pfade der CSS-Dateien, die eine Schrift im Paket einbindet. */
export function fontStylesheets(id: FontId): string[] {
  const font = fontById(id);
  return font.weights.map((weight) => `${font.package}/${font.latinOnly ? `latin-${weight}` : weight}.css`);
}

export function registryProblems(): string[] {
  return FONT_FAMILIES.flatMap((font) => (isBannedFontFamily(font.family) ? [`${font.family} steht auf der Verbotsliste (S1)`] : []));
}
