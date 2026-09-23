import type { CSSProperties } from "react";

import { relativeLuminance } from "@/domain/color/contrast";
import type { DesignDirection } from "@/domain/design/design-direction";
import { type FontCategory, fontById, fontStack } from "@/domain/design/fonts";

// Übersetzt eine Design Direction in CSS-Variablen. Alle Farben einer Kundenseite kommen von hier
// (DESIGN.md §2: je Betrieb eigene Tokens, nie die des Studios).

const RADIUS = { none: "0px", soft: "6px", round: "14px" } as const;

const SCALE = {
  editorial: { h1: "clamp(2.75rem, 7.5vw, 5.75rem)", h2: "clamp(1.9rem, 3.6vw, 2.9rem)", lead: "clamp(1.2rem, 2vw, 1.45rem)" },
  compact: { h1: "clamp(2.4rem, 5.5vw, 4rem)", h2: "clamp(1.6rem, 2.8vw, 2.2rem)", lead: "clamp(1.15rem, 1.8vw, 1.3rem)" },
  monumental: { h1: "clamp(3.25rem, 13vw, 10rem)", h2: "clamp(2.1rem, 5vw, 3.9rem)", lead: "clamp(1.2rem, 2.2vw, 1.55rem)" },
} as const;

/**
 * Mittlere Zeichenbreite je Schriftart in em – daraus berechnet der Hero die größte Schrift, bei
 * der das längste Wort des Namens noch in eine Zeile passt (großzügig geschätzt).
 */
export const NAME_FIT: Readonly<Record<FontCategory, number>> = {
  serif: 0.62,
  "display-serif": 0.62,
  sans: 0.64,
  "display-sans": 0.7,
  condensed: 0.5,
};

const SERIF: ReadonlySet<FontCategory> = new Set(["serif", "display-serif"]);

export function themeStyle(direction: DesignDirection): CSSProperties {
  const { palette, typography } = direction;
  const scale = SCALE[typography.scale];
  const display = fontById(typography.display);
  // Einleitungen in der Titelschrift nur bei Serifen; laute Grotesk-Titel bleiben Überschriften.
  const leadInDisplay = SERIF.has(display.category);
  return {
    "--c-bg": palette.background,
    "--c-surface": palette.surface,
    "--c-text": palette.text,
    "--c-muted": palette.textMuted,
    "--c-primary": palette.primary,
    "--c-on-primary": palette.onPrimary,
    "--c-accent": palette.accent,
    "--c-line": palette.line,
    "--f-display": fontStack(typography.display),
    "--f-body": fontStack(typography.body),
    "--w-display": String(typography.displayWeight),
    "--f-lead": leadInDisplay ? fontStack(typography.display) : fontStack(typography.body),
    // Einleitungen im leichtesten geladenen Schnitt – fette Serifen-Absätze wirken wie Werbung.
    "--w-lead": leadInDisplay ? String(Math.min(...display.weights)) : "400",
    "--name-fit": String(NAME_FIT[display.category]),
    "--scheme": relativeLuminance(palette.background) < 0.2 ? "dark" : "light",
    "--radius": RADIUS[direction.shape.radius],
    "--s-h1": scale.h1,
    "--s-h2": scale.h2,
    "--s-lead": scale.lead,
    "--label-case": typography.labelCase,
    "--label-tracking": typography.labelCase === "uppercase" ? "0.12em" : "0.01em",
  } as CSSProperties;
}
