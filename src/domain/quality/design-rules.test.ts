import { describe, expect, it } from "vitest";

import { BANNED_FONT_FAMILIES, checkMarkup, checkStylesheet, DESIGN_RULES, isBannedFontFamily } from "./design-rules";

const rules = (css: string) => checkStylesheet(css).map((finding) => `${finding.ruleId}:${finding.severity}`);

describe("isBannedFontFamily", () => {
  it("erkennt verbotene Familien unabhängig von Anführungszeichen und Schreibweise", () => {
    expect(isBannedFontFamily("'Inter'")).toBe(true);
    expect(isBannedFontFamily(' "dm sans" ')).toBe(true);
    expect(isBannedFontFamily("system-ui")).toBe(true);
    expect(isBannedFontFamily("Fraunces")).toBe(false);
    expect(BANNED_FONT_FAMILIES).toContain("Montserrat");
  });
});

describe("checkStylesheet", () => {
  it("S1: meldet verbotene Schriften auch als Fallback", () => {
    expect(rules(".a{font-family:'Vollkorn', Inter, serif}")).toEqual(["S1:fehler"]);
    expect(rules(".a{font-family:Vollkorn, Georgia, serif}")).toEqual([]);
  });

  it("S2: meldet Verläufe über mehrere Farbtöne, nicht über Tonstufen oder Grau", () => {
    expect(rules(".a{background:linear-gradient(90deg,#7c3aed,#2563eb)}")).toEqual(["S2:fehler"]);
    expect(rules(".a{background:linear-gradient(rgba(0,0,0,.6),rgba(0,0,0,0))}")).toEqual([]);
    expect(rules(".a{background:linear-gradient(#a43d1e,#863219)}")).toEqual([]);
    expect(rules(".a{background:radial-gradient(circle at 20% 30%, #d8c9a3 0, #f5f0e6 60%)}")).toEqual([]);
  });

  it("S3: meldet backdrop-filter, außer none", () => {
    expect(rules(".a{backdrop-filter:blur(12px) saturate(1.4)}")).toEqual(["S3:fehler"]);
    expect(rules(".a{-webkit-backdrop-filter:blur(8px)}")).toEqual(["S3:fehler"]);
    expect(rules(".a{backdrop-filter:none}")).toEqual([]);
  });

  it("S4: weist auf drei gleich breite Spalten hin", () => {
    expect(rules(".a{grid-template-columns:repeat(3, 1fr)}")).toEqual(["S4:hinweis"]);
    expect(rules(".a{grid-template-columns:2fr 1fr 1fr}")).toEqual([]);
  });

  it("S7: meldet Leuchtschatten, erlaubt harte Versatzschatten", () => {
    expect(rules(".a{text-shadow:0 0 12px #ff0}")).toEqual(["S7:fehler"]);
    expect(rules(".a{text-shadow:2px 2px 0 #000}")).toEqual([]);
  });

  it("S7: meldet ab vier voll gerundeten Elementen eine Pillen-Flut", () => {
    const pill = (name: string) => `.${name}{border-radius:9999px}`;
    expect(rules(["a", "b", "c"].map(pill).join(""))).toEqual([]);
    expect(rules(["a", "b", "c", "d"].map(pill).join(""))).toEqual(["S7:fehler"]);
  });
});

describe("checkMarkup", () => {
  it("S5: meldet Emoji im Text, nicht in Attributen, und lässt ©, ® und Sterne zu", () => {
    expect(checkMarkup("<p>Frische Pizza 🍕</p>").map((f) => f.ruleId)).toEqual(["S5"]);
    expect(checkMarkup('<p title="🍕">Pizza © 2026 · 4,6 ★</p>')).toEqual([]);
  });

  it("S5: meldet Icon-Bibliotheken", () => {
    expect(checkMarkup('<i class="fa fa-phone"></i>').map((f) => f.message)).toEqual(["Icon-Bibliothek im Markup"]);
    expect(checkMarkup('<span class="material-icons">phone</span>')).toHaveLength(1);
    expect(checkMarkup('<a class="fact-link">Karte</a>')).toEqual([]);
  });
});

describe("DESIGN_RULES", () => {
  it("führt alle zehn Regeln aus DESIGN.md §3 und kennzeichnet die automatisch geprüften", () => {
    expect(Object.keys(DESIGN_RULES)).toHaveLength(10);
    expect(Object.entries(DESIGN_RULES).filter(([, rule]) => rule.automated).map(([id]) => id)).toEqual(["S1", "S2", "S3", "S4", "S5", "S7"]);
  });
});
