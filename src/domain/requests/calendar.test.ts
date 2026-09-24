import { describe, expect, it } from "vitest";

import { addDays, daysBetween, formatLongDate, formatShortDate, localMoment, normalizeDate, normalizeTime, weekdayOf } from "./calendar";

describe("localMoment", () => {
  it("rechnet in die Berliner Ortszeit um – Sommer- und Winterzeit", () => {
    expect(localMoment(new Date("2026-09-24T08:00:00Z"))).toEqual({ date: "2026-09-24", minutes: 600 });
    expect(localMoment(new Date("2026-01-15T23:30:00Z"))).toEqual({ date: "2026-01-16", minutes: 30 });
  });

  it("wechselt den Kalendertag an der Berliner Mitternacht, nicht an der UTC-Mitternacht", () => {
    expect(localMoment(new Date("2026-09-24T21:59:00Z")).date).toBe("2026-09-24");
    expect(localMoment(new Date("2026-09-24T22:00:00Z")).date).toBe("2026-09-25");
  });
});

describe("normalizeDate", () => {
  it.each([
    ["2026-09-26", "2026-09-26"],
    ["26.09.2026", "2026-09-26"],
    ["6.9.2026", "2026-09-06"],
    [" 2026-02-28 ", "2026-02-28"],
  ])("liest %j als %j", (input, expected) => {
    expect(normalizeDate(input)).toBe(expected);
  });

  it.each(["", "morgen", "2026-02-30", "31.04.2026", "2026-13-01", "1999-01-01", "26.09.26"])("lehnt %j ab", (input) => {
    expect(normalizeDate(input)).toBeNull();
  });
});

describe("normalizeTime", () => {
  it.each([
    ["19:30", "19:30"],
    ["9:30", "09:30"],
    ["19.30", "19:30"],
    ["00:00", "00:00"],
  ])("liest %j als %j", (input, expected) => {
    expect(normalizeTime(input)).toBe(expected);
  });

  it.each(["", "7", "24:00", "19:60", "halb acht", "19:3"])("lehnt %j ab", (input) => {
    expect(normalizeTime(input)).toBeNull();
  });
});

describe("Kalenderhilfen", () => {
  it("zählt Tage über Monats- und Zeitumstellungsgrenzen", () => {
    expect(daysBetween("2026-09-24", "2026-09-24")).toBe(0);
    expect(daysBetween("2026-09-24", "2026-10-01")).toBe(7);
    expect(daysBetween("2026-10-24", "2026-10-26")).toBe(2);
    expect(daysBetween("2026-09-24", "2026-09-23")).toBe(-1);
  });

  it("rechnet Kalendertage vorwärts über Monats- und Jahresgrenzen", () => {
    expect(addDays("2026-09-24", 7)).toBe("2026-10-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-09-24", 90)).toBe("2026-12-23");
  });

  it("kennt den Wochentag und schreibt deutsch, unabhängig von der Umgebung", () => {
    expect(weekdayOf("2026-09-24")).toBe("do");
    expect(weekdayOf("2026-09-27")).toBe("so");
    expect(formatLongDate("2026-09-26")).toBe("Samstag, 26. September 2026");
    expect(formatLongDate("2026-03-01")).toBe("Sonntag, 1. März 2026");
    expect(formatShortDate("2026-09-26")).toBe("Sa 26.9.");
  });
});
