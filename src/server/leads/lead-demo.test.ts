import { describe, expect, it, vi } from "vitest";

import type { PlaceData } from "@/domain/leads/place-profile";

import { IntegrationNotConfiguredError, type PlaceDetailsPort } from "../integrations/ports";
import { leadDemosAllowed, loadLeadDemo, placesFromEnv } from "./lead-demo";

const PLACE: PlaceData = {
  placeId: "ChIJ_test-Place1234",
  displayName: "Zur Linde",
  formattedAddress: null,
  postalAddress: { postalCode: "00123", locality: "Beispielort", addressLines: ["Dorfstraße 3"] },
  businessStatus: "OPERATIONAL",
  primaryType: "german_restaurant",
  types: [],
  nationalPhoneNumber: null,
  websiteUri: null,
  rating: 4.4,
  userRatingCount: 57,
  regularOpeningHours: null,
};

const fake = (place: PlaceData | null): PlaceDetailsPort => ({ getDetails: vi.fn(async () => place) });
const now = () => new Date("2026-09-23T12:00:00Z");

describe("loadLeadDemo", () => {
  it("baut die Demo-Daten aus Place Details mit Live-Quelle", async () => {
    const result = await loadLeadDemo(PLACE.placeId, { places: fake(PLACE), now });
    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;
    expect(result.demo.facts.name).toMatchObject({ status: "uebernommen", source: { kind: "googlePlacesLive" } });
    expect(result.demo.rating).toEqual({ value: 4.4, count: 57 });
  });

  it("zeigt keine Bewertung ohne Anzahl", async () => {
    const result = await loadLeadDemo(PLACE.placeId, { places: fake({ ...PLACE, userRatingCount: 0 }), now });
    expect(result.kind === "ok" && result.demo.rating).toBeNull();
  });

  it("meldet unbekannte und dauerhaft geschlossene Betriebe", async () => {
    expect(await loadLeadDemo("ChIJ_unknown-12345", { places: fake(null), now })).toEqual({ kind: "notFound" });
    expect(await loadLeadDemo(PLACE.placeId, { places: fake({ ...PLACE, businessStatus: "CLOSED_PERMANENTLY" }), now })).toEqual({
      kind: "blocked",
      reason: "Laut Google dauerhaft geschlossen",
    });
  });
});

describe("leadDemosAllowed", () => {
  it("ist ohne ausdrückliche Freischaltung aus", () => {
    expect(leadDemosAllowed("localhost:3000", {})).toBe(false);
    expect(leadDemosAllowed("localhost:3000", { STUDIO_LEAD_DEMOS: "off" })).toBe(false);
  });

  it.each(["localhost:3000", "127.0.0.1:3200", "[::1]:3000", "localhost"])("erlaubt %s mit STUDIO_LEAD_DEMOS=local", (host) => {
    expect(leadDemosAllowed(host, { STUDIO_LEAD_DEMOS: "local" })).toBe(true);
  });

  it.each(["studio.example.com", "localhost.example.com", "192.168.1.20:3000", "10.0.0.1", ""])("verweigert öffentliche oder fremde Hosts wie %j", (host) => {
    expect(leadDemosAllowed(host, { STUDIO_LEAD_DEMOS: "local" })).toBe(false);
  });

  it("verweigert bei ungültiger Konfiguration", () => {
    expect(leadDemosAllowed("localhost", { STUDIO_LEAD_DEMOS: "public" })).toBe(false);
    expect(leadDemosAllowed(null, { STUDIO_LEAD_DEMOS: "local" })).toBe(false);
  });
});

describe("placesFromEnv", () => {
  it("wirft ohne Schlüssel einen Konfigurationsfehler", () => {
    expect(() => placesFromEnv({})).toThrow(IntegrationNotConfiguredError);
  });

  it("baut den Adapter mit Schlüssel", () => {
    expect(typeof placesFromEnv({ GOOGLE_PLACES_API_KEY: "test-key" }).getDetails).toBe("function");
  });
});
