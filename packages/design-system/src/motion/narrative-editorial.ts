import { z } from "zod";

// Motion-Profil der erzählenden Komposition (ADR 0022). Bewegung zeigt Lesefolge oder Zustand –
// sonst nichts. Alles ist ohne Bewegung vollständig lesbar; bei prefers-reduced-motion gibt es
// keine Scroll-Animation, keine Parallaxe, keine Schleife.

/** Erlaubte Effekte – jeder mit Zweck. */
export const MOTION_EFFECTS = {
  headerOnScroll: "Kopfzeile bekommt beim Scrollen einen Grund – zeigt: Die Seite läuft, die Navigation bleibt.",
  textMaskReveal: "Große Sätze gewinnen beim Lesen an Präsenz – nie unter der Mindestdeckkraft.",
  imageDrift: "Bilder bewegen sich minimal gegen den Scroll – Tiefe, nur am großen Bildschirm.",
  sectionReveal: "Abschnittsköpfe heben sich leicht an, wenn sie ins Bild kommen.",
  hoverFocus: "Präzise Hover- und Fokuszustände für Knöpfe, Links und Karten.",
  contextualCta: "Die mobile Handlungsleiste tritt zurück, wo die Handlung ohnehin im Bild ist.",
} as const;
export type MotionEffect = keyof typeof MOTION_EFFECTS;

/** Verbotene Effekte (DESIGN.md §7, Aufgabe narrative-editorial). */
export const FORBIDDEN_MOTION = {
  autoplayCarousel: "Autoplay-Karussells",
  particles: "Partikel und laute Effekte",
  strongParallax: "Parallaxe über 4 % Verschiebung oder auf Mobilgeräten",
  layoutShift: "Bewegung, die das Layout verschiebt",
  scrolljacking: "Scrolljacking",
  hiddenContent: "Animationen, die Inhalte verstecken",
  purposeless: "Effekte ohne funktionalen oder atmosphärischen Zweck",
} as const;

const easing = z.string().regex(/^cubic-bezier\((?:\s*-?\d*\.?\d+\s*,){3}\s*-?\d*\.?\d+\s*\)$|^(?:ease|ease-out|ease-in-out|linear)$/);

export const motionProfileSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  headerOnScroll: z.object({ enabled: z.boolean(), rangePx: z.number().int().min(40).max(400) }),
  textMaskReveal: z.object({ enabled: z.boolean(), minOpacity: z.number().min(0.3).max(1) }),
  imageDrift: z.object({
    enabled: z.boolean(),
    /** Höchstens 4 % – mehr wäre Parallaxe als Effekt. */
    maxShiftPercent: z.number().min(0).max(4),
    /** Erst ab dieser Breite (rem); darunter keine Bildbewegung. */
    minViewportRem: z.number().min(40),
  }),
  sectionReveal: z.object({ enabled: z.boolean(), distancePx: z.number().min(0).max(24), minOpacity: z.number().min(0.4).max(1) }),
  hoverFocus: z.object({ durationMs: z.number().int().min(80).max(250), easing }),
  contextualCta: z.object({ enabled: z.boolean(), hideWhileVisible: z.array(z.enum(["hero", "reservation", "closing"])) }),
  /** Endlosschleifen sind ausgeschlossen – das Schema kennt nur 0. */
  loops: z.literal(0),
});
export type MotionProfile = z.infer<typeof motionProfileSchema>;

export const NARRATIVE_EDITORIAL_MOTION: MotionProfile = {
  id: "narrative-calm",
  headerOnScroll: { enabled: true, rangePx: 160 },
  textMaskReveal: { enabled: true, minOpacity: 0.35 },
  imageDrift: { enabled: true, maxShiftPercent: 3, minViewportRem: 56 },
  sectionReveal: { enabled: true, distancePx: 14, minOpacity: 0.55 },
  hoverFocus: { durationMs: 160, easing: "cubic-bezier(0.2, 0.6, 0.2, 1)" },
  contextualCta: { enabled: true, hideWhileVisible: ["hero", "reservation", "closing"] },
  loops: 0,
};

export type ResolvedMotion = MotionProfile & { readonly reduced: boolean };

/**
 * Bewegung für einen Besuch. Bei reduzierter Bewegung sind alle scroll- und zeitgesteuerten Effekte
 * aus, Zustandswechsel geschehen ohne Übergang; die kontextuelle Handlungsleiste bleibt als reine
 * Sichtbarkeitsregel erhalten, ohne Animation.
 */
export function resolveMotion(profile: MotionProfile, options: { readonly reducedMotion: boolean }): ResolvedMotion {
  const parsed = motionProfileSchema.parse(profile);
  if (!options.reducedMotion) return { ...parsed, reduced: false };
  return {
    ...parsed,
    reduced: true,
    headerOnScroll: { ...parsed.headerOnScroll, enabled: false },
    textMaskReveal: { ...parsed.textMaskReveal, enabled: false },
    imageDrift: { ...parsed.imageDrift, enabled: false, maxShiftPercent: 0 },
    sectionReveal: { ...parsed.sectionReveal, enabled: false, distancePx: 0 },
    hoverFocus: { ...parsed.hoverFocus, durationMs: 0 },
  };
}

/** Schalter als data-Attribute; das CSS reagiert nur auf "on" und zusätzlich nur ohne reduce-Wunsch. */
export function motionAttributes(motion: ResolvedMotion): Readonly<Record<string, string>> {
  const flag = (enabled: boolean) => (enabled ? "on" : "off");
  return {
    "data-motion-header": flag(motion.headerOnScroll.enabled),
    "data-motion-text": flag(motion.textMaskReveal.enabled),
    "data-motion-image": flag(motion.imageDrift.enabled),
    "data-motion-section": flag(motion.sectionReveal.enabled),
    "data-motion-cta": flag(motion.contextualCta.enabled),
  };
}

export function motionVariables(motion: ResolvedMotion): Readonly<Record<string, string>> {
  return {
    "--m-hover": `${motion.hoverFocus.durationMs}ms`,
    "--m-ease": motion.hoverFocus.easing,
    "--m-header-range": `${motion.headerOnScroll.rangePx}px`,
    "--m-text-min": String(motion.textMaskReveal.minOpacity),
    "--m-drift": `${motion.imageDrift.maxShiftPercent}%`,
    "--m-rise": `${motion.sectionReveal.distancePx}px`,
    "--m-rise-min": String(motion.sectionReveal.minOpacity),
  };
}
