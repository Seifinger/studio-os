import { describe, expect, it } from "vitest";

import {
  detailsFieldMaskHeader,
  fieldMaskHeader,
  FORBIDDEN_PLACES_FIELDS,
  isForbiddenPlacesField,
  PLACE_DETAILS_FIELD_MASKS,
  skuTierOf,
  TEXT_SEARCH_FIELD_MASKS,
} from "./places-fields";

const purposes = Object.keys(TEXT_SEARCH_FIELD_MASKS) as (keyof typeof TEXT_SEARCH_FIELD_MASKS)[];

describe("TEXT_SEARCH_FIELD_MASKS", () => {
  it.each(purposes)("%s fordert keine Fotos, Rezensionen, Zusammenfassungen oder Platzhalter an", (purpose) => {
    const forbidden = TEXT_SEARCH_FIELD_MASKS[purpose].filter((field) => FORBIDDEN_PLACES_FIELDS.has(field));
    expect(forbidden).toEqual([]);
  });

  it.each(purposes)("%s enthält die Place-ID, keine Dubletten und nur gültige Feldnamen", (purpose) => {
    const fields: readonly string[] = TEXT_SEARCH_FIELD_MASKS[purpose];
    expect(fields).toContain("places.id");
    expect(new Set(fields).size).toBe(fields.length);
    for (const field of fields) {
      expect(field).toMatch(/^(places\.[a-zA-Z]+|nextPageToken)$/);
    }
  });

  it("ordnet die Masken den erwarteten Kostenstufen zu", () => {
    expect(skuTierOf(TEXT_SEARCH_FIELD_MASKS.researchDisplay)).toBe("pro");
    expect(skuTierOf(TEXT_SEARCH_FIELD_MASKS.leadSearch)).toBe("enterprise");
  });

  it("baut den Header als kommagetrennte Liste", () => {
    expect(fieldMaskHeader("researchDisplay")).toBe(
      "places.id,places.displayName,places.formattedAddress,places.businessStatus",
    );
  });
});

describe("skuTierOf", () => {
  it("nimmt die höchste Stufe der Maske", () => {
    expect(skuTierOf([])).toBe("essentials");
    expect(skuTierOf(["places.id", "nextPageToken"])).toBe("essentials");
    expect(skuTierOf(["places.id", "places.displayName"])).toBe("pro");
    expect(skuTierOf(["places.displayName", "places.websiteUri"])).toBe("enterprise");
    expect(skuTierOf(["places.websiteUri", "places.servesBeer"])).toBe("enterpriseAtmosphere");
    expect(skuTierOf(["places.goodForGroups"])).toBe("enterpriseAtmosphere");
  });

  it("stuft Fotos als Pro ein – deshalb verbietet eine eigene Liste sie", () => {
    expect(skuTierOf(["places.photos"])).toBe("pro");
    expect(FORBIDDEN_PLACES_FIELDS.has("places.photos")).toBe(true);
  });
});

describe("PLACE_DETAILS_FIELD_MASKS", () => {
  it("fordert für Lead-Demos keine Fotos, Rezensionen oder Zusammenfassungen an", () => {
    expect(PLACE_DETAILS_FIELD_MASKS.leadDemo.filter((field) => isForbiddenPlacesField(field))).toEqual([]);
    for (const field of PLACE_DETAILS_FIELD_MASKS.leadDemo) expect(field).toMatch(/^[a-zA-Z]+$/);
  });

  it("erkennt verbotene Felder auch ohne Präfix", () => {
    expect(isForbiddenPlacesField("photos")).toBe(true);
    expect(isForbiddenPlacesField("reviews")).toBe(true);
    expect(isForbiddenPlacesField("places.editorialSummary")).toBe(true);
    expect(isForbiddenPlacesField("displayName")).toBe(false);
  });

  it("bleibt in der Enterprise-Stufe wie die Lead-Suche – keine Atmosphere-Felder", () => {
    expect(skuTierOf(PLACE_DETAILS_FIELD_MASKS.leadDemo)).toBe("enterprise");
    expect(skuTierOf([...PLACE_DETAILS_FIELD_MASKS.leadDemo, "takeout"])).toBe("enterpriseAtmosphere");
  });

  it("baut den Header ohne Präfix", () => {
    expect(detailsFieldMaskHeader("leadDemo").startsWith("id,displayName,")).toBe(true);
  });
});
