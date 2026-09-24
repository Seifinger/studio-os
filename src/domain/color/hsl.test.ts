import { describe, expect, it } from "vitest";

import { hueDistance, parseCssColor, rgbToHsl } from "./hsl";

describe("rgbToHsl", () => {
  it.each([
    [{ r: 255, g: 0, b: 0 }, { h: 0, s: 100, l: 50 }],
    [{ r: 0, g: 255, b: 0 }, { h: 120, s: 100, l: 50 }],
    [{ r: 0, g: 0, b: 255 }, { h: 240, s: 100, l: 50 }],
    [{ r: 128, g: 128, b: 128 }, { h: 0, s: 0, l: 50.19607843137255 }],
  ])("%o → %o", (rgb, hsl) => {
    const result = rgbToHsl(rgb);
    expect(result.h).toBeCloseTo(hsl.h, 5);
    expect(result.s).toBeCloseTo(hsl.s, 5);
    expect(result.l).toBeCloseTo(hsl.l, 5);
  });
});

describe("parseCssColor", () => {
  it("liest Hex und rgb()", () => {
    expect(parseCssColor("#fff")).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseCssColor("#1B1A17cc")).toEqual({ r: 27, g: 26, b: 23 });
    expect(parseCssColor("rgba(10, 20, 30, 0.5)")).toEqual({ r: 10, g: 20, b: 30 });
    expect(parseCssColor("rgb(10 20 30)")).toEqual({ r: 10, g: 20, b: 30 });
    expect(parseCssColor("var(--accent)")).toBeNull();
    expect(parseCssColor("transparent")).toBeNull();
  });
});

describe("hueDistance", () => {
  it("rechnet über den Nullpunkt des Farbkreises", () => {
    expect(hueDistance(350, 10)).toBe(20);
    expect(hueDistance(0, 180)).toBe(180);
    expect(hueDistance(90, 90)).toBe(0);
  });
});
