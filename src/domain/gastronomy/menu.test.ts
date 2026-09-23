import { describe, expect, it } from "vitest";

import { ALLERGENS, allergenLabels, formatMenuPrice, menuItemSchema, menuSchema } from "./menu";

const item = (overrides: Record<string, unknown> = {}) => ({ name: "Käsespätzle", priceCents: 1350, ...overrides });

describe("menuItemSchema", () => {
  it("setzt leere Listen als Standard und nimmt Preise nur in Cent", () => {
    expect(menuItemSchema.parse(item())).toEqual({ name: "Käsespätzle", priceCents: 1350, dietary: [], allergens: [] });
    expect(menuItemSchema.safeParse(item({ priceCents: 13.5 })).success).toBe(false);
  });

  it("erkennt widersprüchliche Kennzeichnungen", () => {
    expect(menuItemSchema.safeParse(item({ dietary: ["vegan"], allergens: ["milch"] })).success).toBe(false);
    expect(menuItemSchema.safeParse(item({ dietary: ["vegetarisch"], allergens: ["fisch"] })).success).toBe(false);
    expect(menuItemSchema.safeParse(item({ dietary: ["vegetarisch"], allergens: ["milch", "eier"] })).success).toBe(true);
  });

  it("lehnt doppelte Einträge und unbekannte Allergene ab", () => {
    expect(menuItemSchema.safeParse(item({ allergens: ["milch", "milch"] })).success).toBe(false);
    expect(menuItemSchema.safeParse(item({ allergens: ["nuesse"] })).success).toBe(false);
  });
});

describe("menuSchema", () => {
  it("verlangt Abschnitte mit Gerichten und eindeutige Titel", () => {
    expect(menuSchema.safeParse({ sections: [] }).success).toBe(false);
    expect(menuSchema.safeParse({ sections: [{ title: "Vorspeisen", items: [] }] }).success).toBe(false);
    const duplicate = { sections: [{ title: "Pasta", items: [item()] }, { title: "pasta", items: [item()] }] };
    expect(menuSchema.safeParse(duplicate).success).toBe(false);
    expect(menuSchema.safeParse({ sections: [{ title: "Hauptgerichte", items: [item()] }] }).success).toBe(true);
  });
});

describe("Anzeige", () => {
  it("formatiert Preis und Hinweis", () => {
    const parse = (overrides: Record<string, unknown>) => menuItemSchema.parse(item(overrides));
    expect(formatMenuPrice(parse({}))).toBe("13,50 €");
    expect(formatMenuPrice(parse({ priceCents: 480, priceNote: "0,5 l" }))).toBe("4,80 € · 0,5 l");
    expect(formatMenuPrice(parse({ priceCents: undefined, priceNote: "Tagespreis" }))).toBe("Tagespreis");
  });

  it("nennt Allergene in der Reihenfolge der LMIV", () => {
    expect(ALLERGENS).toHaveLength(14);
    const parsed = menuItemSchema.parse(item({ allergens: ["milch", "gluten"] }));
    expect(allergenLabels(parsed)).toEqual(["Glutenhaltiges Getreide", "Milch (einschließlich Laktose)"]);
  });
});
