import { describe, expect, it } from "vitest";

import { businessProfileSchema } from "../content/business-profile";
import { restaurantProfileSchema } from "./restaurant-profile";

describe("restaurantProfileSchema", () => {
  it("ergänzt das Betriebsprofil um Küche, Karte, Signaturgerichte und Besonderheiten", () => {
    const general = Object.keys(businessProfileSchema.shape);
    const restaurant = Object.keys(restaurantProfileSchema.shape);
    expect(restaurant).toEqual([...general, "cuisine", "menu", "signatureDishes", "specials"]);
  });

  it("nimmt eine fiktive Beispielkarte an – ob sie gezeigt werden darf, entscheidet das Gate", () => {
    const profile = restaurantProfileSchema.parse({
      name: { status: "fiktiv", value: "Trattoria Esempio" },
      cuisine: { status: "fiktiv", value: "italienisch" },
      menu: {
        status: "fiktiv",
        value: { sections: [{ title: "Pasta", items: [{ name: "Tagliatelle al ragù", priceCents: 1450, allergens: ["gluten", "eier"] }] }] },
      },
    });
    expect(profile.menu.status).toBe("fiktiv");
    expect(profile.phone.status).toBe("unbekannt");
  });

  it("lehnt unbekannte Küchen ab", () => {
    expect(restaurantProfileSchema.safeParse({ cuisine: { status: "fiktiv", value: "atlantisch" } }).success).toBe(false);
  });
});
