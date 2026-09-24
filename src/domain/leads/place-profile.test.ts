import { describe, expect, it } from "vitest";

import { cuisineFromPlace, factsFromPlace, openingHoursFromPeriods, type PlaceData, placeDemoBlocker } from "./place-profile";

const RETRIEVED = new Date("2026-09-23T10:15:00Z");

const PLACE: PlaceData = {
  placeId: "ChIJtest123456",
  displayName: "Gasthof Beispiel",
  formattedAddress: "Dorfstraße 3, 00123 Beispielort, Deutschland",
  postalAddress: { postalCode: "00123", locality: "Beispielort", addressLines: ["Dorfstraße 3"] },
  businessStatus: "OPERATIONAL",
  primaryType: "german_restaurant",
  types: ["german_restaurant", "restaurant", "food"],
  nationalPhoneNumber: "089 99998100",
  websiteUri: null,
  rating: 4.6,
  userRatingCount: 212,
  regularOpeningHours: {
    periods: [
      { open: { day: 2, hour: 11, minute: 30 }, close: { day: 2, hour: 14, minute: 0 } },
      { open: { day: 2, hour: 17, minute: 30 }, close: { day: 2, hour: 23, minute: 0 } },
      { open: { day: 6, hour: 18, minute: 0 }, close: { day: 0, hour: 1, minute: 0 } },
    ],
  },
};

describe("factsFromPlace", () => {
  it("übernimmt Name, Ort, Adresse, Telefon und Zeiten mit Live-Quelle", () => {
    const facts = factsFromPlace(PLACE, RETRIEVED);
    expect(facts.name).toEqual({
      status: "uebernommen",
      value: "Gasthof Beispiel",
      source: { kind: "googlePlacesLive", placeId: "ChIJtest123456", retrievedAt: "2026-09-23T10:15:00.000Z" },
      recordedAt: "2026-09-23",
    });
    expect(facts.address.value).toEqual({ street: "Dorfstraße 3", postalCode: "00123", locality: "Beispielort" });
    expect(facts.phone.value?.e164).toBe("+4989999981" + "00");
    expect(facts.openingHours.value?.week.di).toEqual([
      { from: "11:30", to: "14:00" },
      { from: "17:30", to: "23:00" },
    ]);
    expect(facts.openingHours.value?.week.sa).toEqual([{ from: "18:00", to: "01:00" }]);
  });

  it("macht die Küche nur zum Vorschlag", () => {
    expect(factsFromPlace({ ...PLACE, displayName: "Zur Linde" }, RETRIEVED).cuisine).toMatchObject({ status: "vorschlag", value: "deutsch" });
    expect(factsFromPlace(PLACE, RETRIEVED).cuisine.status).toBe("vorschlag");
  });

  it("lässt unklare Angaben unbekannt statt zu raten", () => {
    const facts = factsFromPlace(
      { ...PLACE, displayName: "  ", postalAddress: { postalCode: "A-1010", locality: "Wien", addressLines: ["Ring 1"] }, nationalPhoneNumber: "12345", regularOpeningHours: null },
      RETRIEVED,
    );
    expect(facts.name.status).toBe("unbekannt");
    expect(facts.address.status).toBe("unbekannt");
    expect(facts.locality).toMatchObject({ status: "uebernommen", value: "Wien" });
    expect(facts.phone.status).toBe("unbekannt");
    expect(facts.openingHours.status).toBe("unbekannt");
  });
});

describe("openingHoursFromPeriods", () => {
  it("setzt Sonntag = 0 richtig um und erkennt „rund um die Uhr“", () => {
    expect(openingHoursFromPeriods([{ open: { day: 0, hour: 12, minute: 0 }, close: { day: 0, hour: 15, minute: 0 } }])?.week.so).toEqual([{ from: "12:00", to: "15:00" }]);
    expect(openingHoursFromPeriods([{ open: { day: 0, hour: 0, minute: 0 } }])?.week.mi).toEqual([{ from: "00:00", to: "23:59" }]);
  });

  it("gibt null zurück, wenn der Plan widersprüchlich oder leer ist", () => {
    expect(openingHoursFromPeriods([])).toBeNull();
    expect(
      openingHoursFromPeriods([
        { open: { day: 1, hour: 11, minute: 0 }, close: { day: 1, hour: 15, minute: 0 } },
        { open: { day: 1, hour: 14, minute: 0 }, close: { day: 1, hour: 18, minute: 0 } },
      ]),
    ).toBeNull();
    expect(openingHoursFromPeriods([{ open: { day: 9, hour: 11, minute: 0 }, close: { day: 9, hour: 15, minute: 0 } }])).toBeNull();
  });
});

describe("cuisineFromPlace", () => {
  it("bevorzugt den Namen vor dem Google-Typ", () => {
    expect(cuisineFromPlace({ displayName: "Trattoria Roma", primaryType: "restaurant", types: ["pizza_restaurant"] })).toMatchObject({ value: "italienisch" });
    expect(cuisineFromPlace({ displayName: "Zur Post", primaryType: "thai_restaurant", types: [] })).toMatchObject({ value: "thailaendisch", note: "Google-Typ „thai_restaurant“" });
  });

  it("rät nicht, wenn weder Name noch Typ etwas sagen", () => {
    expect(cuisineFromPlace({ displayName: "Zur Post", primaryType: "restaurant", types: ["restaurant", "food"] })).toEqual({ status: "unbekannt", value: null });
  });
});

describe("placeDemoBlocker", () => {
  it("baut keine Demo für dauerhaft geschlossene Betriebe", () => {
    expect(placeDemoBlocker({ businessStatus: "CLOSED_PERMANENTLY" })).toBe("Laut Google dauerhaft geschlossen");
    expect(placeDemoBlocker({ businessStatus: "OPERATIONAL" })).toBeNull();
    expect(placeDemoBlocker({ businessStatus: "CLOSED_TEMPORARILY" })).toBeNull();
  });
});
