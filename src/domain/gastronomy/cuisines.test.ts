import { describe, expect, it } from "vitest";

import { CUISINE_IDS, CUISINES, cuisineFactFromName, cuisineLabel, suggestCuisine } from "./cuisines";

describe("suggestCuisine", () => {
  // Fälle aus gastro-webagentur test/menuCatalog.test.js, soweit sie mit Wortanfang-Treffern gelten.
  it.each([
    ["Pizzeria Tropea", "italienisch"],
    ["RISTORANTE DA MARIO", "italienisch"],
    ["Döneria Neuötting", "tuerkisch"],
    ["China Restaurant Lotus", "chinesisch"],
    ["China Restaurant Peking", "chinesisch"],
    ["Ming Friends", "chinesisch"],
    ["Taverna Akropolis", "griechisch"],
    ["Café Kirchplatz", "cafe"],
    ["Sushi Bar Kyoto", "japanisch"],
    ["Kao Thai Restaurant", "thailaendisch"],
    ["Saigon Bistro", "vietnamesisch"],
    ["Restaurant Miss Hoi An", "vietnamesisch"],
    ["Taj Mahal", "indisch"],
    ["Damaskus Grill", "syrisch"],
    ["Asia Wok Express", "asiatisch"],
    ["Nakama Rolls & Bowls", "asiatisch"],
    ["Gasthof Huber", "bayerisch"],
    ["Brauerei Gasthof Bräu im Moos", "bayerisch"],
  ])("%s → %s", (name, cuisine) => {
    expect(suggestCuisine(name)?.cuisine).toBe(cuisine);
  });

  it.each([
    "Romantik Hotel Post", // v1: "roma" → italienisch
    "Bowlingcenter Mühldorf", // v1: "bowl" → asiatisch
  ])("trifft %s nicht mehr fälschlich", (name) => {
    expect(suggestCuisine(name)).toBeNull();
  });

  it("unterscheidet Currywurst von Curry", () => {
    expect(suggestCuisine("Currywurst am Bahnhof")).toBeNull();
    expect(suggestCuisine("Curry House")?.cuisine).toBe("indisch");
  });

  it.each(["Gasthof zum Drachen", "Flamingo Bar", "Aroma Bistro", "Indigo Lounge"])(
    "ordnet %s keiner falschen Küche zu",
    (name) => {
      const suggestion = suggestCuisine(name);
      expect(suggestion === null || suggestion.cuisine === "bayerisch").toBe(true);
    },
  );

  it.each(["Goldener Hirsch", "Jettenbacher Hof", "Sportheim Tüßling", "Zur alten Linde", "Klabwong", "", null, undefined])(
    "rät bei %j nicht – ohne Stichwort gibt es keinen Vorschlag",
    (name) => {
      expect(suggestCuisine(name)).toBeNull();
    },
  );
});

describe("cuisineFactFromName", () => {
  it("liefert einen Vorschlag des Studios mit Begründung", () => {
    expect(cuisineFactFromName("Pizzeria Tropea")).toEqual({
      status: "vorschlag",
      value: "italienisch",
      by: "studio",
      note: "Name enthält „pizz“",
    });
  });

  it("liefert „unbekannt“ statt eines Standardwerts", () => {
    expect(cuisineFactFromName("Zur alten Linde")).toEqual({ status: "unbekannt", value: null });
  });
});

describe("CUISINES", () => {
  it("hat eindeutige IDs und eigene deutsche Beschriftungen", () => {
    expect(new Set(CUISINE_IDS).size).toBe(CUISINES.length);
    for (const { id, label } of CUISINES) {
      expect(cuisineLabel(id)).toBe(label);
      expect(label).not.toBe(id);
    }
  });
});
