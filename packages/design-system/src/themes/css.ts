import { fontStack } from "@/domain/design/fonts";

import type { Theme, TypeRole } from "./schema";

// Übersetzt ein Theme in CSS-Variablen (Präfix --ne-). Kompositionen lesen Farben, Schriften und
// Maße nur hierüber – im CSS stehen keine Werte eines bestimmten Hauses.

const RADIUS = { none: "0px", soft: "4px", round: "999px" } as const;

function role(prefix: string, value: TypeRole): Record<string, string> {
  return {
    [`--ne-${prefix}-font`]: fontStack(value.font),
    [`--ne-${prefix}-weight`]: String(value.weight),
    [`--ne-${prefix}-style`]: value.italic ? "italic" : "normal",
    [`--ne-${prefix}-tracking`]: `${value.tracking}em`,
    [`--ne-${prefix}-case`]: value.case,
    [`--ne-${prefix}-leading`]: String(value.lineHeight),
  };
}

export function themeVariables(theme: Theme): Readonly<Record<string, string>> {
  const { colors: c, typography: t, spacing: s, container: k } = theme;
  return {
    "--ne-paper": c.paper,
    "--ne-paper-raised": c.paperRaised,
    "--ne-ink": c.ink,
    "--ne-ink-muted": c.inkMuted,
    "--ne-line": c.line,
    "--ne-night": c.night,
    "--ne-night-ink": c.nightInk,
    "--ne-night-muted": c.nightMuted,
    "--ne-primary": c.primary,
    "--ne-on-primary": c.onPrimary,
    "--ne-night-primary": c.nightPrimary,
    "--ne-on-night-primary": c.onNightPrimary,
    "--ne-accent": c.accent,
    "--ne-focus": c.focus,
    ...role("display", t.display),
    ...role("text", t.text),
    ...role("label", t.label),
    ...role("caption", t.caption),
    "--ne-size-hero": t.scale.hero,
    "--ne-size-claim": t.scale.claim,
    "--ne-size-h2": t.scale.h2,
    "--ne-size-h3": t.scale.h3,
    "--ne-size-lead": t.scale.lead,
    "--ne-size-body": t.scale.body,
    "--ne-size-small": t.scale.small,
    "--ne-space-xs": `${s.steps.xs}rem`,
    "--ne-space-s": `${s.steps.s}rem`,
    "--ne-space-m": `${s.steps.m}rem`,
    "--ne-space-l": `${s.steps.l}rem`,
    "--ne-space-xl": `${s.steps.xl}rem`,
    "--ne-space-xxl": `${s.steps.xxl}rem`,
    "--ne-section": `clamp(${s.section.mobile}rem, 9vw, ${s.section.desktop}rem)`,
    "--ne-act": `clamp(${s.act.mobile}rem, 12vw, ${s.act.desktop}rem)`,
    "--ne-measure": `${k.textMaxCh}ch`,
    "--ne-measure-mobile": `${theme.mobile.maxLineCh}ch`,
    "--ne-wide": `${k.wideMaxRem}rem`,
    "--ne-gutter": `clamp(${k.gutter.mobile}rem, 5vw, ${k.gutter.desktop}rem)`,
    "--ne-radius": RADIUS[theme.cta.radius],
    "--ne-touch": `${theme.cta.minTargetPx}px`,
    "--ne-focus-width": `${theme.accessibility.focusRingPx}px`,
  };
}
