import { describe, expect, it } from "vitest";

import { businessProfileSchema } from "./business-profile";

const source = { kind: "business", note: "Gespräch am 23.09." } as const;

describe("businessProfileSchema", () => {
  it("macht jede fehlende Angabe zu „unbekannt“", () => {
    const profile = businessProfileSchema.parse({});
    expect(Object.values(profile).every((fact) => fact.status === "unbekannt")).toBe(true);
    expect(Object.keys(profile)).toContain("openingHours");
  });

  it("lehnt unbekannte Felder ab, damit Tippfehler nicht als „unbekannt“ durchgehen", () => {
    expect(businessProfileSchema.safeParse({ nmae: { status: "unbekannt", value: null } }).success).toBe(false);
  });

  it("prüft Werte auch hinter dem Status", () => {
    const invalid = businessProfileSchema.safeParse({
      address: { status: "bestaetigt", value: { street: "Stadtplatz 1", postalCode: "8445", locality: "Mühldorf" }, source, recordedAt: "2026-09-23" },
      email: { status: "vorschlag", value: "keine-adresse", by: "studio" },
      requestChannels: { status: "bestaetigt", value: { table: false, pickup: false }, source, recordedAt: "2026-09-23" },
    });
    expect(invalid.success).toBe(false);
    const paths = invalid.error?.issues.map((issue) => issue.path.join(".")) ?? [];
    expect(paths).toEqual(expect.arrayContaining(["address.value.postalCode", "email.value", "requestChannels.value"]));
  });

  it("lässt Gästestimmen nur mit Herkunft zu", () => {
    const quote = (value: unknown) =>
      businessProfileSchema.safeParse({ guestQuotes: { status: "bestaetigt", value, source, recordedAt: "2026-09-23" } }).success;
    expect(quote([{ text: "Beste Knödel im Landkreis.", author: "Maria K." }])).toBe(false);
    expect(quote([{ text: "Beste Knödel im Landkreis.", author: "Maria K.", origin: "Gästebuch 2025" }])).toBe(true);
  });
});
