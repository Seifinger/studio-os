import { describe, expect, it } from "vitest";

import { FORBIDDEN_MOTION, motionAttributes, motionProfileSchema, motionVariables, NARRATIVE_EDITORIAL_MOTION, resolveMotion } from "./narrative-editorial";

describe("narrative-editorial Motion", () => {
  it("ist ein gültiges Profil ohne Schleifen", () => {
    expect(motionProfileSchema.safeParse(NARRATIVE_EDITORIAL_MOTION).success).toBe(true);
    expect(NARRATIVE_EDITORIAL_MOTION.loops).toBe(0);
  });

  it("schaltet bei reduzierter Bewegung jede Scroll-Animation, Parallaxe und Übergangszeit ab", () => {
    const reduced = resolveMotion(NARRATIVE_EDITORIAL_MOTION, { reducedMotion: true });
    expect(reduced.reduced).toBe(true);
    expect(reduced.headerOnScroll.enabled).toBe(false);
    expect(reduced.textMaskReveal.enabled).toBe(false);
    expect(reduced.imageDrift).toMatchObject({ enabled: false, maxShiftPercent: 0 });
    expect(reduced.sectionReveal).toMatchObject({ enabled: false, distancePx: 0 });
    expect(reduced.hoverFocus.durationMs).toBe(0);
    expect(reduced.loops).toBe(0);
    expect(Object.values(motionAttributes(reduced)).filter((value) => value === "on")).toEqual(["on"]); // nur die Sichtbarkeitsregel der Handlungsleiste
    expect(motionVariables(reduced)["--m-drift"]).toBe("0%");
  });

  it("lässt ohne Wunsch nach reduzierter Bewegung alle erlaubten Effekte an", () => {
    const full = resolveMotion(NARRATIVE_EDITORIAL_MOTION, { reducedMotion: false });
    expect(Object.values(motionAttributes(full))).toEqual(["on", "on", "on", "on", "on"]);
    expect(motionVariables(full)["--m-hover"]).toBe("160ms");
  });

  it("lehnt verbotene Stärken ab: Parallaxe über 4 %, versteckender Text, Schleifen, lange Übergänge", () => {
    const base = NARRATIVE_EDITORIAL_MOTION;
    expect(motionProfileSchema.safeParse({ ...base, imageDrift: { ...base.imageDrift, maxShiftPercent: 12 } }).success).toBe(false);
    expect(motionProfileSchema.safeParse({ ...base, imageDrift: { ...base.imageDrift, minViewportRem: 20 } }).success).toBe(false);
    expect(motionProfileSchema.safeParse({ ...base, textMaskReveal: { enabled: true, minOpacity: 0 } }).success).toBe(false);
    expect(motionProfileSchema.safeParse({ ...base, sectionReveal: { enabled: true, distancePx: 80, minOpacity: 0.6 } }).success).toBe(false);
    expect(motionProfileSchema.safeParse({ ...base, loops: 3 }).success).toBe(false);
    expect(motionProfileSchema.safeParse({ ...base, hoverFocus: { durationMs: 900, easing: "ease" } }).success).toBe(false);
  });

  it("benennt die verbotenen Effekte", () => {
    expect(Object.keys(FORBIDDEN_MOTION)).toEqual(expect.arrayContaining(["autoplayCarousel", "scrolljacking", "hiddenContent", "layoutShift"]));
  });
});
