import { describe, expect, it } from "vitest";

import { type DesignDirection, designDirectionSchema, directionProblems } from "./design-direction";

const base: DesignDirection = {
  id: "probe",
  name: "Probe-Direction",
  mood: "Kochbuchseite auf Papier, Tinte in Rotbraun, Karte als lange Liste.",
  cuisines: ["italienisch"],
  references: [
    { name: "Bocca di Lupo", url: "https://www.boccadilupo.com", kind: "restaurant", adopted: ["Karte als Liste"], rejected: [], verified: false, foundIn: "test" },
    { name: "Alison Roman", url: "https://styles.refero.design/style/x", kind: "design", adopted: ["Cream-Papier"], rejected: [], verified: false, foundIn: "test" },
  ],
  typography: { display: "cormorant-garamond", displayWeight: 600, body: "karla", scale: "editorial", labelCase: "normal" },
  palette: {
    background: "#fbf6ee",
    surface: "#ffffff",
    text: "#2a211a",
    textMuted: "#6a5d50",
    primary: "#8f3418",
    onPrimary: "#ffffff",
    accent: "#b8862c",
    line: "#e8dccb",
  },
  shape: { radius: "none" },
  layout: { hero: "immersive-type", menu: "course-led", gallery: "none" },
  motion: { intensity: "quiet" },
};

describe("designDirectionSchema", () => {
  it("akzeptiert eine vollständige Direction", () => {
    expect(designDirectionSchema.parse(base)).toEqual(base);
  });

  it("verlangt Hex-Farben, registrierte Schriften und mindestens zwei Referenzen", () => {
    expect(designDirectionSchema.safeParse({ ...base, palette: { ...base.palette, text: "black" } }).success).toBe(false);
    expect(designDirectionSchema.safeParse({ ...base, typography: { ...base.typography, body: "inter" } }).success).toBe(false);
    expect(designDirectionSchema.safeParse({ ...base, references: base.references.slice(0, 1) }).success).toBe(false);
  });

  it("lehnt Google als Referenz und Referenzen ohne Übernahme ab", () => {
    const google = { ...base.references[0], url: "https://www.google.com/maps/place/x" };
    expect(designDirectionSchema.safeParse({ ...base, references: [google, base.references[1]] }).success).toBe(false);
    const nothingAdopted = { ...base.references[0], adopted: [] };
    expect(designDirectionSchema.safeParse({ ...base, references: [nothingAdopted, base.references[1]] }).success).toBe(false);
  });
});

describe("directionProblems", () => {
  it("findet bei einer guten Direction nichts", () => {
    expect(directionProblems(base)).toEqual([]);
  });

  it("meldet jeden Kontrastverstoß mit Aufgabe und Wert", () => {
    const problems = directionProblems({ ...base, palette: { ...base.palette, textMuted: "#b9ad9f", onPrimary: "#b8862c" } });
    expect(problems).toHaveLength(3);
    expect(problems[0]).toMatch(/^Nebentext auf Grund: textMuted\/background \d\.\d\d:1 < 4\.5:1$/);
    expect(problems.some((p) => p.startsWith("Schrift auf Primärknopf"))).toBe(true);
  });

  it("verlangt eine Restaurant- und eine Design-Referenz", () => {
    const onlyDesign = base.references.map((reference) => ({ ...reference, kind: "design" as const }));
    expect(directionProblems({ ...base, references: onlyDesign })).toContain("Mindestens eine reale Restaurant-Website als Referenz fehlt");
  });

  it("meldet Floskeln in der Stimmung und „cinematic“ ohne Material", () => {
    const problems = directionProblems({ ...base, mood: "Eine unvergessliche kulinarische Reise.", layout: { ...base.layout, hero: "cinematic" } });
    expect(problems.filter((p) => p.startsWith("Stimmung enthält Floskel"))).toHaveLength(2);
    expect(problems.some((p) => p.includes("cinematic"))).toBe(true);
  });
});
