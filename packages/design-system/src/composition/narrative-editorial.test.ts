import { describe, expect, it } from "vitest";

import { composeNarrative, DEFAULT_NARRATIVE_SEQUENCE, type NarrativeConfig, narrativeConfigSchema } from "./narrative-editorial";

const CONFIG: NarrativeConfig = { sequence: [...DEFAULT_NARRATIVE_SEQUENCE], primaryAction: "tableRequest", secondaryAction: "menu" };
const FULL = { claim: true, story: true, craft: true, menu: true, atmosphere: true };

describe("composeNarrative", () => {
  it("unterstützt die vollständige Standardsequenz mit Aktwechseln", () => {
    const { steps, dropped } = composeNarrative(CONFIG, FULL);
    expect(steps.map((step) => step.kind)).toEqual(["hero", "claim", "story", "craft", "menu", "atmosphere", "reservation", "visit", "closing"]);
    expect(dropped).toEqual([]);
    expect(steps.filter((step) => step.actChange).map((step) => step.kind)).toEqual(["claim", "atmosphere", "reservation", "closing"]);
    expect(steps.find((step) => step.kind === "menu")?.anchor).toBe("karte");
  });

  it("lässt Abschnitte ohne Inhalt weg und nennt den Grund", () => {
    const { steps, dropped } = composeNarrative(CONFIG, { ...FULL, craft: false, atmosphere: false });
    expect(steps.map((step) => step.kind)).not.toContain("craft");
    expect(dropped).toEqual([
      { kind: "craft", reason: "Kein Inhalt – ein leerer Abschnitt wäre Dekoration" },
      { kind: "atmosphere", reason: "Kein Inhalt – ein leerer Abschnitt wäre Dekoration" },
    ]);
  });

  it("bleibt pro Kunde konfigurierbar: eigene Reihenfolge, Überschriften, Akte", () => {
    const custom: NarrativeConfig = {
      ...CONFIG,
      sequence: [
        { kind: "hero", act: "paper", why: "Helles Haus, heller Eingang." },
        { kind: "menu", act: "paper", title: "Heute auf dem Herd", why: "Die Karte ist hier der Grund zu kommen." },
        { kind: "reservation", act: "paper", why: "Direkt nach der Karte entscheiden." },
        { kind: "visit", act: "paper", why: "Adresse und Zeiten." },
        { kind: "closing", act: "night", why: "Ein dunkler Abschluss." },
      ],
    };
    const { steps } = composeNarrative(custom, FULL);
    expect(steps.map((step) => step.kind)).toEqual(["hero", "menu", "reservation", "visit", "closing"]);
    expect(steps[1]?.title).toBe("Heute auf dem Herd");
  });

  it("lässt das Formular weg, wenn die primäre Handlung ein Anruf ist", () => {
    const { steps } = composeNarrative({ ...CONFIG, primaryAction: "call" }, FULL);
    expect(steps.map((step) => step.kind)).not.toContain("reservation");
  });
});

describe("narrativeConfigSchema", () => {
  it.each([
    ["ohne Eingang am Anfang", { ...CONFIG, sequence: CONFIG.sequence.slice(1) }],
    ["ohne Abschluss am Ende", { ...CONFIG, sequence: CONFIG.sequence.slice(0, -1) }],
    ["ohne Anfahrt", { ...CONFIG, sequence: CONFIG.sequence.filter((step) => step.kind !== "visit") }],
    ["mit doppeltem Abschnitt", { ...CONFIG, sequence: [...CONFIG.sequence.slice(0, 3), CONFIG.sequence[2], ...CONFIG.sequence.slice(3)] }],
    ["mit Tischanfrage ohne Ziel", { ...CONFIG, sequence: CONFIG.sequence.filter((step) => step.kind !== "reservation") }],
    ["ohne Begründung", { ...CONFIG, sequence: CONFIG.sequence.map((step) => ({ ...step, why: "" })) }],
  ])("lehnt eine Sequenz %s ab", (_label, config) => {
    expect(narrativeConfigSchema.safeParse(config).success).toBe(false);
  });
});
