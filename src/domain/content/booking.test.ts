import { describe, expect, it } from "vitest";

import { externalBookingSchema } from "./booking";

describe("externalBookingSchema", () => {
  it.each([
    ["resmio", "https://app.resmio.com/zur-linde/widget"],
    ["opentable", "https://www.opentable.de/r/zur-linde"],
    ["quandoo", "https://www.quandoo.de/place/zur-linde-123"],
    ["thefork", "https://www.thefork.de/restaurant/zur-linde"],
    ["other", "https://reservierung.zur-linde.de"],
  ])("akzeptiert %s mit passender Domain", (provider, url) => {
    expect(externalBookingSchema.safeParse({ provider, url }).success).toBe(true);
  });

  it("erkennt vertauschte Anbieter und Domains, die nur ähnlich heißen", () => {
    expect(externalBookingSchema.safeParse({ provider: "quandoo", url: "https://www.opentable.de/r/x" }).success).toBe(false);
    expect(externalBookingSchema.safeParse({ provider: "resmio", url: "https://resmio.com.betrug.example/x" }).success).toBe(false);
  });

  it("verlangt https und lehnt Google-Links ab", () => {
    expect(externalBookingSchema.safeParse({ provider: "other", url: "http://reservierung.zur-linde.de" }).success).toBe(false);
    expect(externalBookingSchema.safeParse({ provider: "other", url: "https://www.google.com/maps/reserve/x" }).success).toBe(false);
  });
});
