import { describe, expect, it } from "vitest";

import { restaurantProfileSchema } from "../gastronomy/restaurant-profile";
import { assertRenderable, RenderGateError } from "./render-gate";

const source = { kind: "business", note: "Gespräch am 23.09." } as const;
const confirmed = <T>(value: T) => ({ status: "bestaetigt" as const, value, source, recordedAt: "2026-09-23" });

describe("assertRenderable", () => {
  it("lässt eine Lead-Demo mit Platzhaltern durch und meldet sie im Audit", () => {
    const profile = restaurantProfileSchema.parse({ name: confirmed("Gasthaus Zur Linde") });
    const audit = assertRenderable(profile, { kind: "leadDemo" });
    expect(audit.placeholders).toContain("menu");
    expect(audit.violations).toEqual([]);
  });

  it("bricht ab, wenn eine erfundene Angabe auf die Seite eines echten Betriebs soll", () => {
    const profile = restaurantProfileSchema.parse({
      name: confirmed("Gasthaus Zur Linde"),
      story: { status: "fiktiv", value: "Seit 1890 in Familienhand." },
    });
    expect(() => assertRenderable(profile, { kind: "leadDemo" })).toThrow(RenderGateError);
    try {
      assertRenderable(profile, { kind: "leadDemo" });
    } catch (error) {
      expect((error as RenderGateError).violations).toEqual([
        { field: "story", reason: "Erfundene Angabe auf der Seite eines echten Betriebs" },
      ]);
    }
  });

  it("verlangt für live die bestätigte Freigabe des Betriebs", () => {
    const withoutApproval = restaurantProfileSchema.parse({ name: confirmed("Gasthaus Zur Linde") });
    expect(() => assertRenderable(withoutApproval, { kind: "customer", stage: "live" })).toThrow(/Freigabe/);
    const approved = restaurantProfileSchema.parse({ name: confirmed("Gasthaus Zur Linde"), publicationApproved: confirmed(true) });
    expect(() => assertRenderable(approved, { kind: "customer", stage: "live" })).not.toThrow();
  });

  it("akzeptiert eine übernommene Freigabe nicht – nur der Betrieb selbst gibt frei", () => {
    const profile = restaurantProfileSchema.parse({
      name: confirmed("Gasthaus Zur Linde"),
      publicationApproved: { status: "uebernommen", value: true, source, recordedAt: "2026-09-23" },
    });
    expect(() => assertRenderable(profile, { kind: "customer", stage: "live" })).toThrow(/Freigabe/);
  });
});
