import { z } from "zod";

import { euroCentsSchema, formatEuro } from "../content/money";

// Speisekarte als strukturierter Inhalt (HTML statt PDF, DESIGN.md §8). Preise in Cent.

export const DIETARY_TAGS = ["vegetarisch", "vegan", "glutenfrei", "laktosefrei", "scharf"] as const;

/** Die 14 Hauptallergene nach LMIV, Anhang II. Kennbuchstaben sind je Haus verschieden und fehlen deshalb. */
export const ALLERGENS = [
  { id: "gluten", label: "Glutenhaltiges Getreide" },
  { id: "krebstiere", label: "Krebstiere" },
  { id: "eier", label: "Eier" },
  { id: "fisch", label: "Fisch" },
  { id: "erdnuesse", label: "Erdnüsse" },
  { id: "soja", label: "Soja" },
  { id: "milch", label: "Milch (einschließlich Laktose)" },
  { id: "schalenfruechte", label: "Schalenfrüchte" },
  { id: "sellerie", label: "Sellerie" },
  { id: "senf", label: "Senf" },
  { id: "sesam", label: "Sesamsamen" },
  { id: "sulfite", label: "Schwefeldioxid und Sulfite" },
  { id: "lupinen", label: "Lupinen" },
  { id: "weichtiere", label: "Weichtiere" },
] as const;

type AllergenId = (typeof ALLERGENS)[number]["id"];
const ALLERGEN_IDS = ALLERGENS.map((allergen) => allergen.id) as [AllergenId, ...AllergenId[]];

const ANIMAL_ALLERGENS: readonly AllergenId[] = ["eier", "fisch", "krebstiere", "milch", "weichtiere"];
const MEAT_OR_FISH_ALLERGENS: readonly AllergenId[] = ["fisch", "krebstiere", "weichtiere"];

const uniqueList = <T extends z.ZodType>(item: T) =>
  z
    .array(item)
    .default([])
    .refine((values) => new Set(values).size === values.length, { error: "Doppelter Eintrag" });

export const menuItemSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(300).optional(),
    priceCents: euroCentsSchema.optional(),
    /** z. B. „0,5 l“ oder „Tagespreis“ */
    priceNote: z.string().trim().min(1).max(40).optional(),
    dietary: uniqueList(z.enum(DIETARY_TAGS)),
    allergens: uniqueList(z.enum(ALLERGEN_IDS)),
  })
  .superRefine((item, ctx) => {
    if (item.dietary.includes("vegan") && item.allergens.some((a) => ANIMAL_ALLERGENS.includes(a))) {
      ctx.addIssue({ code: "custom", path: ["dietary"], message: "Als vegan markiert, aber mit tierischem Allergen" });
    }
    if (item.dietary.includes("vegetarisch") && item.allergens.some((a) => MEAT_OR_FISH_ALLERGENS.includes(a))) {
      ctx.addIssue({ code: "custom", path: ["dietary"], message: "Als vegetarisch markiert, aber mit Fisch oder Meeresfrüchten" });
    }
  });

export const menuSectionSchema = z.object({
  title: z.string().trim().min(1).max(80),
  note: z.string().trim().min(1).max(200).optional(),
  items: z.array(menuItemSchema).min(1, { error: "Ein Abschnitt braucht mindestens ein Gericht" }),
});

export const menuSchema = z
  .object({
    sections: z.array(menuSectionSchema).min(1),
    /** z. B. „Alle Preise inkl. MwSt.“ */
    note: z.string().trim().min(1).max(300).optional(),
  })
  .refine(
    (menu) => new Set(menu.sections.map((section) => section.title.toLocaleLowerCase("de-DE"))).size === menu.sections.length,
    { error: "Abschnittstitel doppelt" },
  );

export type MenuItem = z.infer<typeof menuItemSchema>;
export type Menu = z.infer<typeof menuSchema>;

/** Preisangabe für die Anzeige: „11,50 €“, „11,50 € · 0,5 l“, „Tagespreis“ oder leer. */
export function formatMenuPrice(item: MenuItem): string {
  const price = item.priceCents === undefined ? null : formatEuro(item.priceCents);
  return [price, item.priceNote].filter(Boolean).join(" · ");
}

export function allergenLabels(item: MenuItem): string[] {
  return ALLERGENS.filter((allergen) => item.allergens.includes(allergen.id)).map((allergen) => allergen.label);
}
