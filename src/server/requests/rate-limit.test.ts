import { describe, expect, it } from "vitest";

import { createRateLimiter, createRequestLimits } from "./rate-limit";

function clock(start = 1_000_000) {
  let time = start;
  return { now: () => time, advance: (ms: number) => (time += ms) };
}

describe("createRateLimiter", () => {
  it("lässt bis zum Limit durch und nennt danach die Wartezeit", () => {
    const { now, advance } = clock();
    const limiter = createRateLimiter({ limit: 2, windowMs: 60_000, now });
    expect(limiter.hit("a")).toEqual({ allowed: true });
    expect(limiter.hit("a")).toEqual({ allowed: true });
    expect(limiter.hit("a")).toEqual({ allowed: false, retryAfterSeconds: 60 });
    advance(59_500);
    expect(limiter.hit("a")).toEqual({ allowed: false, retryAfterSeconds: 1 });
  });

  it("öffnet das Fenster nach Ablauf wieder und zählt Schlüssel getrennt", () => {
    const { now, advance } = clock();
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, now });
    expect(limiter.hit("a").allowed).toBe(true);
    expect(limiter.hit("b").allowed).toBe(true);
    expect(limiter.hit("a").allowed).toBe(false);
    advance(1000);
    expect(limiter.hit("a").allowed).toBe(true);
  });

  it("hält den Speicher begrenzt – abgelaufene und älteste Einträge fallen zuerst", () => {
    const { now, advance } = clock();
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 2, now });
    limiter.hit("alt");
    advance(500);
    limiter.hit("mittel");
    // „neu“ verdrängt den ältesten Eintrag; „alt“ darf danach wieder.
    limiter.hit("neu");
    expect(limiter.hit("mittel").allowed).toBe(false);
    expect(limiter.hit("alt").allowed).toBe(true);
  });

  it("lehnt unsinnige Einstellungen ab", () => {
    expect(() => createRateLimiter({ limit: 0, windowMs: 1000 })).toThrow();
    expect(() => createRateLimiter({ limit: 1, windowMs: 0 })).toThrow();
  });
});

describe("createRequestLimits", () => {
  it("begrenzt Bestätigungen an dieselbe Gast-Adresse auf drei je Stunde", () => {
    const { now, advance } = clock();
    const limits = createRequestLimits(now);
    for (let index = 0; index < 3; index += 1) expect(limits.guest.hit("gast@example.org").allowed).toBe(true);
    expect(limits.guest.hit("gast@example.org").allowed).toBe(false);
    advance(60 * 60_000);
    expect(limits.guest.hit("gast@example.org").allowed).toBe(true);
  });

  it("lässt je Absender zehn Versuche in zehn Minuten zu", () => {
    const limits = createRequestLimits(clock().now);
    for (let index = 0; index < 10; index += 1) expect(limits.client.hit("203.0.113.7").allowed).toBe(true);
    expect(limits.client.hit("203.0.113.7").allowed).toBe(false);
  });
});
