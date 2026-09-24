import { describe, expect, it } from "vitest";

import { businessProfileSchema } from "../content/business-profile";
import { cuisineFactFromName } from "../gastronomy/cuisines";
import { restaurantProfileSchema } from "../gastronomy/restaurant-profile";
import { openQuestions, statusCounts } from "./progress";
import { BRIEFING_QUESTIONS } from "./questions";

const source = { kind: "businessWebsite", url: "https://zur-linde.example/impressum" } as const;

describe("BRIEFING_QUESTIONS", () => {
  it("hat zu jedem Feld des Restaurantprofils genau eine Frage", () => {
    const fields = BRIEFING_QUESTIONS.map((entry) => entry.field);
    expect(new Set(fields).size).toBe(fields.length);
    expect(fields.toSorted()).toEqual(Object.keys(restaurantProfileSchema.shape).toSorted());
  });

  it("ordnet allgemeine Fragen dem branchenneutralen Profil zu", () => {
    const general = new Set(Object.keys(businessProfileSchema.shape));
    for (const entry of BRIEFING_QUESTIONS) {
      expect(general.has(entry.field), entry.field).toBe(entry.sector === "allgemein");
    }
  });

  it("fragt in der Sie-Form und endet mit Fragezeichen oder Bitte", () => {
    for (const { question } of BRIEFING_QUESTIONS) {
      expect(question).not.toMatch(/\b(du|dein|deine|dir|dich)\b/i);
      expect(question).toMatch(/[?.]$/);
    }
  });
});

describe("openQuestions", () => {
  // Personalisierte Lead-Demo: Name und Ort aus eigener Recherche, Küche als Vorschlag, sonst nichts.
  const leadProfile = restaurantProfileSchema.parse({
    name: { status: "uebernommen", value: "Gasthaus Zur Linde", source, recordedAt: "2026-09-23" },
    locality: { status: "uebernommen", value: "Mühldorf am Inn", source, recordedAt: "2026-09-23" },
    cuisine: cuisineFactFromName("Gasthaus Zur Linde"),
  });

  it("listet alles Nicht-Belegte in Gesprächsreihenfolge", () => {
    const open = openQuestions(leadProfile);
    expect(open.map((entry) => entry.field).slice(0, 3)).toEqual(["address", "phone", "whatsapp"]);
    expect(open.some((entry) => entry.field === "name")).toBe(false);
    expect(open).toHaveLength(BRIEFING_QUESTIONS.length - 2);
  });

  it("legt Vorschläge zur Bestätigung vor", () => {
    expect(openQuestions(leadProfile).find((entry) => entry.field === "cuisine")).toEqual({
      field: "cuisine",
      question: "Welche Küche kochen Sie?",
      status: "vorschlag",
      suggestion: "bayerisch",
    });
  });

  it("fragt beim branchenneutralen Profil nicht nach der Speisekarte", () => {
    const open = openQuestions(businessProfileSchema.parse({}));
    expect(open.some((entry) => entry.field === "menu")).toBe(false);
    expect(open).toHaveLength(Object.keys(businessProfileSchema.shape).length);
  });
});

describe("statusCounts", () => {
  it("zählt alle fünf Status", () => {
    const counts = statusCounts(
      restaurantProfileSchema.parse({
        name: { status: "uebernommen", value: "Gasthaus Zur Linde", source, recordedAt: "2026-09-23" },
        cuisine: { status: "vorschlag", value: "bayerisch", by: "studio" },
      }),
    );
    expect(counts).toEqual({
      bestaetigt: 0,
      uebernommen: 1,
      vorschlag: 1,
      unbekannt: BRIEFING_QUESTIONS.length - 2,
      fiktiv: 0,
    });
  });
});
