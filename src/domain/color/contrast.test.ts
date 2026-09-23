import { describe, expect, it } from "vitest";
import { contrastRatio, parseHexColor, relativeLuminance, WCAG_AA } from "./contrast";

describe("parseHexColor", () => {
  it("liest sechsstellige und dreistellige Werte", () => {
    expect(parseHexColor("#1b1a17")).toEqual({ r: 27, g: 26, b: 23 });
    expect(parseHexColor("#FFF")).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHexColor("  #0a0B0c ")).toEqual({ r: 10, g: 11, b: 12 });
  });

  it.each(["", "#", "#12", "#1234", "#12345g", "123456", "rgb(0,0,0)", "#1234567"])(
    "lehnt %j ab",
    (value) => {
      expect(() => parseHexColor(value)).toThrow(/Ungültige Hex-Farbe/);
    },
  );
});

describe("relativeLuminance", () => {
  it("liefert 0 für Schwarz und 1 für Weiß", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 10);
  });

  it("akzeptiert RGB-Objekte", () => {
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 10);
  });
});

describe("contrastRatio", () => {
  it("ergibt 21:1 für Schwarz auf Weiß und ist symmetrisch", () => {
    expect(contrastRatio("#000", "#fff")).toBeCloseTo(21, 10);
    expect(contrastRatio("#fff", "#000")).toBeCloseTo(21, 10);
  });

  it("ergibt 1:1 für gleiche Farben", () => {
    expect(contrastRatio("#857e71", "#857e71")).toBe(1);
  });

  it("trifft bekannte Referenzwerte", () => {
    // Häufig zitierte Grenzfälle: #767676 besteht AA auf Weiß knapp, #777777 nicht.
    expect(contrastRatio("#767676", "#ffffff")).toBeGreaterThanOrEqual(WCAG_AA.text);
    expect(contrastRatio("#777777", "#ffffff")).toBeLessThan(WCAG_AA.text);
  });
});
