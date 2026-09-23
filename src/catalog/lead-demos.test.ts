import { describe, expect, it } from "vitest";

import { creativeDirectionProblems, creativeDirectionSchema } from "@/domain/design/creative-direction";
import { imageSlotSchema, resolveImageSlot } from "@/domain/design/image-plan";
import { CUISINE_IDS } from "@/domain/gastronomy/cuisines";

import { DIRECTIONS } from "./directions";
import { directionForCuisine, LEAD_IMAGE_SLOTS, leadCreativeDirection } from "./lead-demos";

describe("Lead-Demos im Katalog", () => {
  it.each([...CUISINE_IDS])("findet für %s die passende Direction", (cuisine) => {
    expect(directionForCuisine(cuisine).cuisines).toContain(cuisine);
  });

  it("fällt ohne Küche auf das Bistro-System zurück", () => {
    expect(directionForCuisine(null).id).toBe("bistro-leinen");
  });

  it.each(DIRECTIONS.map((direction) => [direction.id, direction] as const))("%s ergibt eine gültige, floskelfreie Dramaturgie", (_id, direction) => {
    const creative = leadCreativeDirection(direction);
    expect(creativeDirectionSchema.safeParse(creative).success).toBe(true);
    expect(creativeDirectionProblems(creative)).toEqual([]);
    const sections = creative.dramaturgy.map((entry) => entry.section);
    if (direction.layout.gallery === "none") expect(sections).not.toContain("imageSlots");
    if (direction.layout.hero === "split-editorial") expect(sections).not.toContain("specials");
  });

  it("füllt Bildplätze nie mit Bildern", () => {
    for (const slot of LEAD_IMAGE_SLOTS) {
      expect(imageSlotSchema.safeParse(slot).success).toBe(true);
      expect(resolveImageSlot(slot).show).toBe("slot");
    }
  });
});
