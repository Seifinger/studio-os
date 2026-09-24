import { describe, expect, it } from "vitest";

import type { Fact } from "../provenance/fact";
import { offers, probeTarget, requestTargetFromProfile } from "./target";

const source = { kind: "business", note: "Telefonat mit dem Wirt" } as const;
const confirmed = <T>(value: T): Fact<T> => ({ status: "bestaetigt", value, source, recordedAt: "2026-09-23" });
const fictional = <T>(value: T): Fact<T> => ({ status: "fiktiv", value });
const unknown = { status: "unbekannt", value: null } as const;

const customerFacts = {
  name: confirmed("Gasthaus zur Probe"),
  email: confirmed("anfragen@gasthaus.example"),
  requestChannels: confirmed({ table: true, pickup: false }),
  openingHours: unknown,
  phone: confirmed({ e164: "+498999998150", display: "089 99998 150" }),
  address: unknown,
};

const live = { kind: "customer", stage: "live" } as const;

describe("requestTargetFromProfile", () => {
  it("baut das Ziel einer Kundenseite aus bestätigten Angaben", () => {
    const result = requestTargetFromProfile("gasthaus-probe", customerFacts, live);
    expect(result).toEqual({
      ok: true,
      target: {
        siteId: "gasthaus-probe",
        businessName: "Gasthaus zur Probe",
        recipient: "anfragen@gasthaus.example",
        channels: { table: true, pickup: false },
        openingHours: null,
        phone: { e164: "+498999998150", display: "089 99998 150" },
        address: null,
        probe: false,
      },
    });
  });

  it("verschickt nie an eine nur vorgeschlagene Adresse – auch nicht in der Vorschau", () => {
    const facts = { ...customerFacts, email: { status: "vorschlag", value: "info@gasthaus.example", by: "studio" } as const };
    const result = requestTargetFromProfile("gasthaus-probe", facts, { kind: "customer", stage: "preview" });
    expect(result).toEqual({ ok: false, reason: "Keine bestätigte E-Mail-Adresse für Anfragen" });
  });

  it("verschickt aus Beispielen und Lead-Demos nichts", () => {
    expect(requestTargetFromProfile("gasthaus-probe", customerFacts, { kind: "showcase" }).ok).toBe(false);
    expect(requestTargetFromProfile("gasthaus-probe", customerFacts, { kind: "leadDemo" }).ok).toBe(false);
  });

  it("verlangt vereinbarte Anfragearten und eine gültige Seitenkennung", () => {
    expect(requestTargetFromProfile("gasthaus-probe", { ...customerFacts, requestChannels: unknown }, live)).toEqual({ ok: false, reason: "Keine vereinbarten Anfragearten" });
    expect(requestTargetFromProfile("../etwas", customerFacts, live).ok).toBe(false);
  });
});

describe("probeTarget", () => {
  const showcaseFacts = {
    name: fictional("Kramerwirt"),
    email: unknown,
    requestChannels: fictional({ table: true, pickup: false }),
    openingHours: unknown,
    phone: fictional({ e164: "+498999998101", display: "089 99998 101" }),
    address: fictional({ street: "Kirchplatz 4", postalCode: "00301", locality: "Aubrunn" }),
  };

  it("nutzt die erfundenen Angaben, schickt aber ans Studio-Postfach und markiert die Probe", () => {
    const result = probeTarget("probe-kramerwirt", showcaseFacts, "studio@example.org");
    expect(result.ok && result.target).toMatchObject({ businessName: "Kramerwirt", recipient: "studio@example.org", probe: true, phone: { display: "089 99998 101" } });
  });

  it("lehnt echte (bestätigte) Angaben in einer Probe ab – die gehören nie in ein Beispiel", () => {
    const result = probeTarget("probe-kramerwirt", { ...showcaseFacts, name: confirmed("Echter Wirt") }, "studio@example.org");
    expect(result.ok).toBe(false);
  });
});

describe("offers", () => {
  it("kennt die vereinbarten Anfragearten", () => {
    const result = requestTargetFromProfile("gasthaus-probe", customerFacts, live);
    if (!result.ok) throw new Error(result.reason);
    expect(offers(result.target, "table")).toBe(true);
    expect(offers(result.target, "pickup")).toBe(false);
  });
});
