import { describe, expect, it } from "vitest";

import { pickStable, stableHash } from "./stable-hash";

describe("stableHash", () => {
  it("trifft die offiziellen FNV-1a-Testwerte", () => {
    expect(stableHash("")).toBe(0x811c9dc5);
    expect(stableHash("a")).toBe(0xe40c292c);
    expect(stableHash("foobar")).toBe(0xbf9cf968);
  });

  it("rechnet über UTF-8, also auch Umlaute systemunabhängig", () => {
    expect(stableHash("Mühldorf")).toBe(stableHash("Mühldorf"));
    expect(stableHash("Mühldorf")).not.toBe(stableHash("Muhldorf"));
  });
});

describe("pickStable", () => {
  const options = ["a", "b", "c"] as const;

  it("wählt für denselben Schlüssel immer dieselbe Option", () => {
    expect(pickStable(options, "ChIJ-zur-linde")).toBe(pickStable(options, "ChIJ-zur-linde"));
  });

  it("verteilt verschiedene Schlüssel auf alle Optionen", () => {
    const picked = new Set(Array.from({ length: 60 }, (_, index) => pickStable(options, `lead-${index}`)));
    expect(picked).toEqual(new Set(options));
  });

  it("wirft bei leerer Auswahl", () => {
    expect(() => pickStable([], "x")).toThrow(/mindestens eine Option/);
  });
});
