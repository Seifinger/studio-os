import { describe, expect, it } from "vitest";

import type { Fact } from "./fact";
import { auditFacts, gate, type GateContext, pagePolicy } from "./gate";

const source = { kind: "business", note: "Gespräch" } as const;
const facts = {
  bestaetigt: { status: "bestaetigt", value: "B", source, recordedAt: "2026-09-23" },
  uebernommen: { status: "uebernommen", value: "U", source, recordedAt: "2026-09-23" },
  vorschlag: { status: "vorschlag", value: "V", by: "studio" },
  unbekannt: { status: "unbekannt", value: null },
  fiktiv: { status: "fiktiv", value: "F" },
} satisfies Record<string, Fact<string>>;

const contexts = {
  showcase: { kind: "showcase" },
  leadDemo: { kind: "leadDemo" },
  preview: { kind: "customer", stage: "preview" },
  live: { kind: "customer", stage: "live" },
} satisfies Record<string, GateContext>;

// Die vollständige Entscheidungstabelle aus ADR 0015 – jede Zelle einmal.
const EXPECTED: Record<keyof typeof facts, Record<keyof typeof contexts, string>> = {
  bestaetigt: { showcase: "violation", leadDemo: "value", preview: "value", live: "value" },
  uebernommen: { showcase: "violation", leadDemo: "value", preview: "value", live: "value" },
  vorschlag: { showcase: "draft", leadDemo: "draft", preview: "draft", live: "violation" },
  unbekannt: { showcase: "omit", leadDemo: "placeholder", preview: "placeholder", live: "omit" },
  fiktiv: { showcase: "value", leadDemo: "violation", preview: "violation", live: "violation" },
};

describe("gate", () => {
  for (const [status, row] of Object.entries(EXPECTED)) {
    for (const [contextName, expected] of Object.entries(row)) {
      it(`${status} in ${contextName} → ${expected}`, () => {
        const outcome = gate(facts[status as keyof typeof facts], contexts[contextName as keyof typeof contexts]);
        expect(outcome.show).toBe(expected);
      });
    }
  }

  it("gibt Werte unverändert weiter und begründet Verstöße", () => {
    expect(gate(facts.bestaetigt, contexts.live)).toEqual({ show: "value", value: "B" });
    expect(gate(facts.vorschlag, contexts.leadDemo)).toEqual({ show: "draft", value: "V" });
    expect(gate(facts.fiktiv, contexts.leadDemo)).toEqual({
      show: "violation",
      reason: "Erfundene Angabe auf der Seite eines echten Betriebs",
    });
  });
});

describe("auditFacts", () => {
  it("sammelt Verstöße, Entwürfe, Platzhalter und Ausgelassenes je Feld", () => {
    const audit = auditFacts(
      { name: facts.bestaetigt, usp: facts.vorschlag, oeffnungszeiten: facts.unbekannt, speisekarte: facts.fiktiv },
      contexts.preview,
    );
    expect(audit).toEqual({
      violations: [{ field: "speisekarte", reason: "Erfundene Angabe auf der Seite eines echten Betriebs" }],
      drafts: ["usp"],
      placeholders: ["oeffnungszeiten"],
      omitted: [],
    });
  });

  it("blockiert live jeden Vorschlag", () => {
    const audit = auditFacts({ name: facts.bestaetigt, usp: facts.vorschlag }, contexts.live);
    expect(audit.violations.map((v) => v.field)).toEqual(["usp"]);
  });
});

describe("pagePolicy", () => {
  it("kennzeichnet Beispiele, Demos und Vorschauen und hält sie aus Suchmaschinen", () => {
    expect(pagePolicy(contexts.showcase)).toEqual({
      noindex: true,
      unlisted: false,
      notice: "Beispielseite des Studios – dieser Betrieb ist frei erfunden.",
    });
    expect(pagePolicy(contexts.leadDemo, "Gasthaus Zur Linde")).toEqual({
      noindex: true,
      unlisted: true,
      notice: "Konzeptentwurf des Studios – nicht die offizielle Website von Gasthaus Zur Linde.",
    });
    expect(pagePolicy(contexts.leadDemo).notice).toContain("dieses Betriebs");
    expect(pagePolicy(contexts.preview)).toMatchObject({ noindex: true, unlisted: true });
  });

  it("lässt nur die freigegebene Kundenseite ohne Hinweis und indexierbar", () => {
    expect(pagePolicy(contexts.live)).toEqual({ noindex: false, unlisted: false, notice: null });
  });
});
