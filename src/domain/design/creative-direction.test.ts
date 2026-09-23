import { describe, expect, it } from "vitest";

import { restaurantProfileSchema } from "../gastronomy/restaurant-profile";
import { checkSignatures, type CreativeDirection, creativeDirectionProblems, creativeDirectionSchema } from "./creative-direction";

const direction: CreativeDirection = {
  idea: "Die Seite ist die Tafel neben der Tür: heute, morgen, die ganze Woche.",
  effect: "Nach drei Sekunden weiß man, was es heute gibt und bis wann die Küche offen hat.",
  metaphor: "Kreidetafel mit Tagesgerichten, darunter die feste Karte auf Papier.",
  dramaturgy: [
    { section: "hero", weight: "gross", why: "Name und das heutige Gericht zuerst – dafür kommen die Leute." },
    { section: "specials", weight: "gross", why: "Die Tageskarte ist das Konzept des Hauses und steht vor der festen Karte." },
    { section: "menu", weight: "normal", why: "Die feste Karte zum Nachschlagen, als ruhige Liste." },
    { section: "visit", weight: "normal", why: "Adresse, Zeiten und Telefon am Ende, wo man sie sucht." },
  ],
  signatures: [
    { title: "Tafel", description: "Tagesgerichte in Kreideschrift-Anmutung, mit Datum oben rechts.", evidence: ["specials"] },
  ],
  omissions: ["Keine Gästestimmen ohne Einverständnis"],
};

describe("creativeDirectionSchema", () => {
  it("akzeptiert eine begründete Dramaturgie", () => {
    expect(creativeDirectionSchema.safeParse(direction).success).toBe(true);
  });

  it("verlangt Hero am Anfang, keine Dopplungen, Anfahrt und höchstens zwei Signaturen", () => {
    const [hero, ...rest] = direction.dramaturgy;
    expect(creativeDirectionSchema.safeParse({ ...direction, dramaturgy: [...rest, hero] }).success).toBe(false);
    expect(creativeDirectionSchema.safeParse({ ...direction, dramaturgy: [...direction.dramaturgy, rest[0]] }).success).toBe(false);
    expect(creativeDirectionSchema.safeParse({ ...direction, dramaturgy: direction.dramaturgy.filter((d) => d.section !== "visit") }).success).toBe(false);
    const three = [direction.signatures[0], direction.signatures[0], direction.signatures[0]];
    expect(creativeDirectionSchema.safeParse({ ...direction, signatures: three }).success).toBe(false);
  });

  it("findet Floskeln in Leitidee und Begründungen", () => {
    expect(creativeDirectionProblems(direction)).toEqual([]);
    expect(creativeDirectionProblems({ ...direction, idea: "Tauchen Sie ein in unsere Welt." })).toHaveLength(1);
  });
});

describe("checkSignatures", () => {
  it("behält Signaturen mit Beleg und verwirft sie ohne", () => {
    const withSpecials = restaurantProfileSchema.parse({ specials: { status: "fiktiv", value: ["Mittagstisch von Montag bis Freitag"] } });
    expect(checkSignatures(direction, withSpecials, { kind: "showcase" }).kept).toHaveLength(1);

    const without = restaurantProfileSchema.parse({});
    expect(checkSignatures(direction, without, { kind: "showcase" })).toEqual({ kept: [], dropped: [{ title: "Tafel", missing: ["specials"] }] });
  });

  it("zählt Platzhalter in Lead-Demos nicht als Beleg", () => {
    const profile = restaurantProfileSchema.parse({});
    expect(checkSignatures(direction, profile, { kind: "leadDemo" }).dropped).toHaveLength(1);
  });
});
