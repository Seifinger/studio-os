import { describe, expect, it } from "vitest";

import { pickupForm, tableForm } from "../../../tests/support/request-fixtures";
import { FIELD_LIMITS } from "./fields";
import { parseRequest } from "./parse";

describe("parseRequest – Tischanfrage", () => {
  it("normalisiert eine gültige Anfrage", () => {
    const result = parseRequest("table", tableForm({ name: "  Maria   Huber ", datum: "25.09.2026", uhrzeit: "19.30", telefon: "0171 234 5678", nachricht: "Kinderstuhl\r\n\r\n\r\nbitte" }));
    expect(result).toEqual({
      ok: true,
      request: {
        kind: "table",
        name: "Maria Huber",
        email: "maria@example.org",
        phone: { e164: "+491712345678", display: "0171 234 5678" },
        date: "2026-09-25",
        time: "19:30",
        partySize: 4,
        note: "Kinderstuhl\n\nbitte",
      },
    });
  });

  it("macht einzeilige Felder einzeilig – kein Einschleusen von Kopfzeilen über Zeilenumbrüche", () => {
    const result = parseRequest("table", tableForm({ name: "Maria\r\nBcc: fremd@example.com\u0000" }));
    expect(result.ok && result.request.name).toBe("Maria Bcc: fremd@example.com");
  });

  it("lässt Telefon und Anmerkung leer zu", () => {
    const result = parseRequest("table", tableForm());
    expect(result.ok && result.request.phone).toBeNull();
    expect(result.ok && result.request.kind === "table" && result.request.note).toBeNull();
  });

  it("meldet jeden Fehler am eigenen Feld", () => {
    const result = parseRequest("table", { art: "tisch" });
    expect(result.ok).toBe(false);
    expect(!result.ok && Object.keys(result.errors).sort()).toEqual(["datum", "email", "name", "personen", "uhrzeit"]);
  });

  it.each([
    [{ email: "maria@" }, "email"],
    [{ email: "keine adresse" }, "email"],
    [{ telefon: "12345" }, "telefon"],
    [{ telefon: "0171-abc" }, "telefon"],
    [{ personen: "0" }, "personen"],
    [{ personen: "vier" }, "personen"],
    [{ personen: "2.5" }, "personen"],
    [{ name: "M" }, "name"],
    [{ name: "<script>" }, "name"],
    [{ name: "x".repeat(FIELD_LIMITS.name + 1) }, "name"],
    [{ nachricht: "x".repeat(FIELD_LIMITS.nachricht + 1) }, "nachricht"],
    [{ datum: "2026-02-30" }, "datum"],
    [{ uhrzeit: "25:00" }, "uhrzeit"],
  ])("lehnt %j ab (Feld %s)", (overrides, field) => {
    const result = parseRequest("table", tableForm(overrides));
    expect(result.ok).toBe(false);
    expect(!result.ok && Object.keys(result.errors)).toEqual([field]);
  });

  it("sagt bei einer falschen Telefonnummer, dass das Feld leer bleiben darf", () => {
    const result = parseRequest("table", tableForm({ telefon: "12345" }));
    expect(!result.ok && result.errors.telefon).toMatch(/Vorwahl fehlt.*darf auch leer bleiben/);
  });
});

describe("parseRequest – Abholung", () => {
  it("verlangt die Bestellung und behält ihre Zeilen", () => {
    const result = parseRequest("pickup", pickupForm());
    expect(result.ok && result.request).toMatchObject({ kind: "pickup", order: "2 × Schweinebraten\n1 × Kaiserschmarrn", time: "12:15" });
    const missing = parseRequest("pickup", pickupForm({ bestellung: " " }));
    expect(!missing.ok && missing.errors).toEqual({ bestellung: "Bitte schreiben Sie, was wir vorbereiten dürfen." });
  });

  it("fragt nach Abholtag und Abholzeit statt nach Datum und Uhrzeit", () => {
    const result = parseRequest("pickup", pickupForm({ datum: "", uhrzeit: "" }));
    expect(!result.ok && result.errors.datum).toMatch(/Abholtag/);
    expect(!result.ok && result.errors.uhrzeit).toMatch(/Abholzeit/);
  });

  it("ignoriert Tischfelder bei einer Abholung", () => {
    const result = parseRequest("pickup", pickupForm({ personen: "viele" }));
    expect(result.ok).toBe(true);
  });
});
