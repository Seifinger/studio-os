import { describe, expect, it } from "vitest";
import { z } from "zod";

import { type Fact, factSchema, isEstablished, isGoogleUrl, sourceSchema, UNKNOWN } from "./fact";

const text = factSchema(z.string().trim().min(1));
const list = factSchema(z.array(z.string()));

const site = { kind: "businessWebsite", url: "https://gasthaus-beispiel.de/impressum" } as const;

describe("factSchema", () => {
  it("akzeptiert alle fünf Status mit passenden Pflichtfeldern", () => {
    const cases: unknown[] = [
      { status: "bestaetigt", value: "Zur Linde", source: { kind: "business", note: "Gespräch am 23.09." }, recordedAt: "2026-09-23" },
      { status: "uebernommen", value: "Zur Linde", source: site, recordedAt: "2026-09-23" },
      { status: "vorschlag", value: "Wirtshaus am Stadtplatz", by: "studio" },
      { status: "unbekannt", value: null },
      { status: "fiktiv", value: "Trattoria Esempio" },
    ];
    for (const input of cases) expect(text.safeParse(input).success, JSON.stringify(input)).toBe(true);
  });

  it("macht ein fehlendes Feld zu „unbekannt“", () => {
    expect(text.parse(undefined)).toEqual({ status: "unbekannt", value: null });
    expect(UNKNOWN).toEqual({ status: "unbekannt", value: null });
  });

  it("lässt „unbekannt“ keinen Wert tragen", () => {
    expect(text.safeParse({ status: "unbekannt", value: "doch etwas" }).success).toBe(false);
  });

  it.each([
    ["bestaetigt", { source: site, recordedAt: "2026-09-23" }],
    ["uebernommen", { source: site, recordedAt: "2026-09-23" }],
    ["vorschlag", { by: "ki" }],
    ["fiktiv", {}],
  ])("lehnt einen leeren Wert mit Status %s ab", (status, extra) => {
    expect(text.safeParse({ status, value: "   ", ...extra }).success).toBe(false);
    expect(list.safeParse({ status, value: [], ...extra }).success).toBe(false);
  });

  it("verlangt Quelle und Datum für bestätigte und übernommene Angaben", () => {
    expect(text.safeParse({ status: "bestaetigt", value: "x" }).success).toBe(false);
    expect(text.safeParse({ status: "uebernommen", value: "x", source: site }).success).toBe(false);
    expect(text.safeParse({ status: "uebernommen", value: "x", source: site, recordedAt: "23.09.2026" }).success).toBe(false);
  });

  it("kennt keine anderen Status", () => {
    expect(text.safeParse({ status: "confirmed", value: "x" }).success).toBe(false);
  });
});

describe("sourceSchema", () => {
  it("lehnt Google Places als Quellenart ab", () => {
    const result = sourceSchema.safeParse({ kind: "googlePlaces", note: "Suchergebnis" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toMatch(/Google Places ist keine speicherbare Quelle/);
  });

  it.each([
    "https://www.google.com/maps/place/Zur+Linde",
    "https://maps.google.de/?cid=123",
    "https://maps.app.goo.gl/abc",
    "https://g.page/zur-linde",
    "https://lh3.googleusercontent.com/p/foto.jpg",
  ])("lehnt Google-Links als Quelle ab: %s", (url) => {
    const result = sourceSchema.safeParse({ kind: "studioResearch", url });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toMatch(/Google-Inhalte/);
  });

  it("erlaubt Websites, die Google nur im Namen tragen", () => {
    expect(isGoogleUrl("https://googlehupf-cafe.de")).toBe(false);
    expect(isGoogleUrl("keine url")).toBe(false);
    expect(sourceSchema.safeParse({ kind: "studioResearch", url: "https://googlehupf-cafe.de" }).success).toBe(true);
  });

  it("verlangt bei der Website des Betriebs die URL und sonst URL oder Notiz", () => {
    expect(sourceSchema.safeParse({ kind: "businessWebsite", note: "gesehen" }).success).toBe(false);
    expect(sourceSchema.safeParse({ kind: "onSite" }).success).toBe(false);
    expect(sourceSchema.safeParse({ kind: "onSite", note: "Aushang an der Tür, 23.09." }).success).toBe(true);
  });
});

describe("isEstablished", () => {
  it("gilt nur für bestätigte und übernommene Angaben", () => {
    const facts: Fact<string>[] = [
      { status: "bestaetigt", value: "a", source: { kind: "business", note: "Mail" }, recordedAt: "2026-09-23" },
      { status: "uebernommen", value: "a", source: site, recordedAt: "2026-09-23" },
      { status: "vorschlag", value: "a", by: "studio" },
      { status: "unbekannt", value: null },
      { status: "fiktiv", value: "a" },
    ];
    expect(facts.map(isEstablished)).toEqual([true, true, false, false, false]);
  });
});
