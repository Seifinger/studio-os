import { describe, expect, it, vi } from "vitest";

import { createGooglePlaces, PlacesRequestError } from "./google-places";

const KEY = "test-schluessel-3f9a";
const PLACE_ID = "ChIJ_test-Place1234";

const DETAILS = {
  id: PLACE_ID,
  displayName: { text: "Gasthof Beispiel", languageCode: "de" },
  formattedAddress: "Dorfstraße 3, 00123 Beispielort",
  postalAddress: { postalCode: "00123", locality: "Beispielort", addressLines: ["Dorfstraße 3"] },
  businessStatus: "OPERATIONAL",
  types: ["restaurant"],
  rating: 4.5,
  userRatingCount: 88,
  regularOpeningHours: { periods: [{ open: { day: 1, hour: 11, minute: 0 }, close: { day: 1, hour: 22, minute: 0 } }], weekdayDescriptions: [] },
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("createGooglePlaces().getDetails", () => {
  it("fragt Place Details mit fester Field Mask und Schlüssel im Header an – nie in der URL", async () => {
    const fetch = vi.fn(async () => json(DETAILS));
    const places = createGooglePlaces({ apiKey: KEY, fetch });

    const place = await places.getDetails(PLACE_ID, "leadDemo");

    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(`https://places.googleapis.com/v1/places/${PLACE_ID}?languageCode=de&regionCode=DE`);
    expect(url).not.toContain(KEY);
    const headers = init.headers as Record<string, string>;
    expect(headers["X-Goog-Api-Key"]).toBe(KEY);
    expect(headers["X-Goog-FieldMask"]).toContain("regularOpeningHours");
    expect(headers["X-Goog-FieldMask"]).not.toMatch(/photos|reviews|Summary/);
    expect(init.cache).toBe("no-store");

    expect(place).toMatchObject({ placeId: PLACE_ID, displayName: "Gasthof Beispiel", rating: 4.5, nationalPhoneNumber: null, primaryType: null });
    expect(place?.regularOpeningHours?.periods).toHaveLength(1);
  });

  it("lehnt ungültige Place-IDs ab, ohne Google anzufragen", async () => {
    const fetch = vi.fn(async () => json(DETAILS));
    const places = createGooglePlaces({ apiKey: KEY, fetch });
    for (const id of ["", "kurz", "../../etwas", "a b c d e f g h i j k"]) {
      await expect(places.getDetails(id, "leadDemo")).rejects.toThrow(PlacesRequestError);
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it("liefert null für unbekannte Place-IDs", async () => {
    const places = createGooglePlaces({ apiKey: KEY, fetch: async () => json({ error: { code: 404 } }, 404) });
    expect(await places.getDetails(PLACE_ID, "leadDemo")).toBeNull();
  });

  it("meldet HTTP-Fehler nur mit Status, ohne Antworttext oder Schlüssel", async () => {
    const places = createGooglePlaces({ apiKey: KEY, fetch: async () => json({ error: { message: `API key ${KEY} invalid` } }, 403) });
    const error = await places.getDetails(PLACE_ID, "leadDemo").catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(PlacesRequestError);
    expect((error as PlacesRequestError).status).toBe(403);
    expect(String((error as Error).message)).not.toContain(KEY);
  });

  it("meldet Netzwerkfehler und unerwartete Antworten", async () => {
    const offline = createGooglePlaces({ apiKey: KEY, fetch: async () => Promise.reject(new TypeError("fetch failed")) });
    await expect(offline.getDetails(PLACE_ID, "leadDemo")).rejects.toThrow("Google Places nicht erreichbar");
    const odd = createGooglePlaces({ apiKey: KEY, fetch: async () => json({ displayName: "ohne ID" }) });
    await expect(odd.getDetails(PLACE_ID, "leadDemo")).rejects.toThrow("Unerwartete Antwort von Google Places");
  });
});
