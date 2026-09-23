// WCAG-2.x-Kontrast, neu geschrieben nach der Formel der W3C-Spezifikation
// (Referenzen: gastro-webagentur src/colorMath.js, gastro-v3 src/tokens/index.js).
// Reiner Fachkern: kein I/O, keine Abhängigkeiten.

export type Rgb = { readonly r: number; readonly g: number; readonly b: number };

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** "#1b1a17" oder "#fff" → { r, g, b } (0–255). Wirft bei ungültigen Werten. */
export function parseHexColor(hex: string): Rgb {
  const match = HEX_COLOR.exec(hex.trim());
  if (!match?.[1]) {
    throw new Error(`Ungültige Hex-Farbe: "${hex}"`);
  }
  const digits = match[1].length === 3 ? [...match[1]].map((d) => d + d).join("") : match[1];
  const value = Number.parseInt(digits, 16);
  return { r: (value >> 16) & 0xff, g: (value >> 8) & 0xff, b: value & 0xff };
}

// sRGB-Schwelle 0,04045 wie in IEC 61966-2-1 (WCAG nennt historisch 0,03928;
// der Unterschied liegt unterhalb jeder 8-Bit-Farbstufe).
function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Relative Leuchtdichte nach WCAG 2.x, 0 (schwarz) bis 1 (weiß). */
export function relativeLuminance(color: string | Rgb): number {
  const { r, g, b } = typeof color === "string" ? parseHexColor(color) : color;
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** Kontrastverhältnis zweier Farben, 1 bis 21. Reihenfolge egal. */
export function contrastRatio(a: string | Rgb, b: string | Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Mindestkontraste nach WCAG 2.2, Stufe AA. */
export const WCAG_AA = {
  /** Fließtext */
  text: 4.5,
  /** Große Schrift (≥ 24 px oder ≥ 18,66 px fett) */
  largeText: 3,
  /** Grenzen von Bedienelementen und grafische Objekte */
  nonText: 3,
} as const;
