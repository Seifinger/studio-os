import { describe, expect, it } from "vitest";

import { designDirectionSchema, directionProblems } from "@/domain/design/design-direction";
import { fontById } from "@/domain/design/fonts";
import { CUISINE_IDS } from "@/domain/gastronomy/cuisines";

import { DIRECTIONS } from "./directions";

describe("Design Directions im Katalog", () => {
  it.each(DIRECTIONS.map((direction) => [direction.id, direction] as const))("%s ist gültig und ohne Befund", (_id, direction) => {
    expect(designDirectionSchema.safeParse(direction).success).toBe(true);
    expect(directionProblems(direction)).toEqual([]);
    expect(fontById(direction.typography.display).weights).toContain(direction.typography.displayWeight);
  });

  it("deckt jede Küche genau einmal ab", () => {
    const covered = DIRECTIONS.flatMap((direction) => [...direction.cuisines]);
    expect(covered.toSorted()).toEqual([...CUISINE_IDS].toSorted());
  });

  it("gibt jeder Direction eine eigene Display-Schrift und eine eigene Layout-Kombination (Tauschprobe)", () => {
    const displays = DIRECTIONS.map((direction) => direction.typography.display);
    expect(new Set(displays).size).toBe(DIRECTIONS.length);
    const layouts = DIRECTIONS.map(({ layout }) => `${layout.hero}/${layout.menu}/${layout.gallery}`);
    expect(new Set(layouts).size).toBe(DIRECTIONS.length);
    expect(new Set(DIRECTIONS.map((direction) => direction.id)).size).toBe(DIRECTIONS.length);
  });

  it("nutzt keine Referenz aus Google und belegt jede mit ihrer Herkunft", () => {
    for (const direction of DIRECTIONS) {
      for (const reference of direction.references) expect(reference.foundIn).toMatch(/^gastro-webagentur v2\/designsysteme\//);
    }
  });
});
