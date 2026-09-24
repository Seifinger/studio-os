import { parseHexColor, type Rgb } from "./contrast";

// Farbton und Sättigung – für die Prüfung „kein Verlauf über mehrere Farbtöne“ (DESIGN.md S2).

export type Hsl = { readonly h: number; readonly s: number; readonly l: number };

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;
  if (delta === 0) return { h: 0, s: 0, l: l * 100 };
  const s = delta / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) h = ((gn - bn) / delta) % 6;
  else if (max === gn) h = (bn - rn) / delta + 2;
  else h = (rn - gn) / delta + 4;
  h *= 60;
  return { h: h < 0 ? h + 360 : h, s: s * 100, l: l * 100 };
}

/** Liest `#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb(…)` und `rgba(…)`; sonst `null`. */
export function parseCssColor(value: string): Rgb | null {
  const trimmed = value.trim().toLowerCase();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})(?:[0-9a-f]{2})?$/.exec(trimmed);
  if (hex?.[1]) return parseHexColor(`#${hex[1]}`);
  const rgb = /^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/.exec(trimmed);
  if (rgb) return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) };
  return null;
}

/** Kürzester Abstand zweier Farbtöne auf dem Farbkreis (0–180). */
export function hueDistance(a: number, b: number): number {
  const distance = Math.abs(a - b) % 360;
  return distance > 180 ? 360 - distance : distance;
}
