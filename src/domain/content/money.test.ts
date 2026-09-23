import { describe, expect, it } from "vitest";

import { euroCentsSchema, formatEuro, parseEuro } from "./money";

describe("formatEuro", () => {
  it.each([
    [1150, "11,50 €"],
    [850, "8,50 €"],
    [0, "0,00 €"],
    [123456, "1.234,56 €"],
  ])("%i Cent → %s", (cents, expected) => {
    expect(formatEuro(cents)).toBe(expected);
  });
});

describe("parseEuro", () => {
  it.each([
    ["11,50", 1150],
    ["11.50", 1150],
    ["11,5", 1150],
    ["11", 1100],
    ["11 €", 1100],
    ["11,50 €", 1150],
    ["  8,90EUR ", 890],
  ])("%j → %i Cent", (input, cents) => {
    expect(parseEuro(input)).toBe(cents);
  });

  it.each(["", "abc", "-3,50", "11,505", "1.234,50", "11,50 € p. P."])("lehnt %j ab", (input) => {
    expect(parseEuro(input)).toBeNull();
  });
});

describe("euroCentsSchema", () => {
  it("nimmt nur ganze, nicht negative Cent-Beträge", () => {
    expect(euroCentsSchema.safeParse(1150).success).toBe(true);
    expect(euroCentsSchema.safeParse(11.5).success).toBe(false);
    expect(euroCentsSchema.safeParse(-100).success).toBe(false);
  });
});
