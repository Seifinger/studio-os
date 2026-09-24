import { describe, expect, it } from "vitest";

import { NOW, TARGET } from "../../../tests/support/request-fixtures";
import type { TableRequest } from "./parse";
import { HORIZON_DAYS } from "./fields";
import { checkRequest, LEAD_MINUTES } from "./rules";

const request = (overrides: Partial<TableRequest> = {}): TableRequest => ({
  kind: "table",
  name: "Maria Huber",
  email: "maria@example.org",
  phone: null,
  date: "2026-09-25",
  time: "19:30",
  partySize: 4,
  note: null,
  ...overrides,
});

describe("checkRequest", () => {
  it("lässt eine Anfrage in der Öffnungszeit durch", () => {
    expect(checkRequest(request(), TARGET, NOW)).toEqual({});
  });

  it("lehnt vergangene Tage ab", () => {
    expect(checkRequest(request({ date: "2026-09-23" }), TARGET, NOW)).toEqual({ datum: "Dieser Tag liegt in der Vergangenheit." });
  });

  it(`nimmt Anfragen bis ${HORIZON_DAYS} Tage im Voraus an und nennt danach das Telefon`, () => {
    expect(checkRequest(request({ date: "2026-12-23", time: "12:00" }), TARGET, NOW)).toEqual({});
    expect(checkRequest(request({ date: "2026-12-24", time: "12:00" }), TARGET, NOW).datum).toMatch(/90 Tage.*089 99998 150/);
  });

  it(`verlangt am selben Tag ${LEAD_MINUTES} Minuten Vorlauf – Berliner Zeit`, () => {
    // NOW ist 10:00 Uhr in Berlin; mittags ist geöffnet.
    const today = (time: string) => checkRequest(request({ date: "2026-09-24", time }), TARGET, NOW);
    expect(today("11:30")).toEqual({});
    expect(today("10:15").uhrzeit).toMatch(/30 Minuten Vorlauf/);
    // Kurz vor Mitternacht UTC ist in Berlin schon der nächste Tag.
    const lateEvening = new Date("2026-09-24T22:30:00Z");
    expect(checkRequest(request({ date: "2026-09-24" }), TARGET, lateEvening).datum).toMatch(/Vergangenheit/);
  });

  it("nennt Ruhetage beim Namen", () => {
    expect(checkRequest(request({ date: "2026-09-28" }), TARGET, NOW)).toEqual({ datum: "Montag ist Ruhetag – bitte einen anderen Tag wählen." });
  });

  it("nennt bei geschlossener Uhrzeit die Zeiten des Tages", () => {
    expect(checkRequest(request({ time: "15:00" }), TARGET, NOW)).toEqual({ uhrzeit: "Um 15:00 Uhr ist geschlossen. Freitag: 11:30–14:00, 17:30–22:00 Uhr." });
    expect(checkRequest(request({ time: "22:00" }), TARGET, NOW).uhrzeit).toMatch(/geschlossen/);
  });

  it("zählt die Nacht nach Samstag zum Sonntag", () => {
    expect(checkRequest(request({ date: "2026-09-27", time: "00:30" }), TARGET, NOW)).toEqual({});
    expect(checkRequest(request({ date: "2026-09-26", time: "23:45" }), TARGET, NOW)).toEqual({});
  });

  it("prüft ohne bekannte Öffnungszeiten nur den Kalender", () => {
    const target = { ...TARGET, openingHours: null };
    expect(checkRequest(request({ date: "2026-09-28", time: "15:00" }), target, NOW)).toEqual({});
  });

  it("schickt große Gruppen ans Telefon – mit Nummer, wenn bekannt", () => {
    expect(checkRequest(request({ partySize: 13 }), TARGET, NOW).personen).toMatch(/mehr als 12 Personen.*089 99998 150/);
    expect(checkRequest(request({ partySize: 13 }), { ...TARGET, phone: null }, NOW).personen).toMatch(/Bitte rufen Sie an\.$/);
    expect(checkRequest(request({ partySize: 12 }), TARGET, NOW)).toEqual({});
  });
});
