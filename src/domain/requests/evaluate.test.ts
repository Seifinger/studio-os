import { describe, expect, it } from "vitest";

import { NOW, pickupForm, TARGET, tableForm } from "../../../tests/support/request-fixtures";
import { evaluateRequest } from "./evaluate";
import { MISSING_MESSAGES, missingFields, REQUEST_FIELDS, requestKindFromValue } from "./fields";
import { parseRequest } from "./parse";
import { requestResponseSchema, sentMessage } from "./response";

describe("evaluateRequest", () => {
  it("gibt eine gültige Anfrage frei", () => {
    const result = evaluateRequest("table", tableForm(), TARGET, NOW);
    expect(result.kind).toBe("ok");
  });

  it("prüft Spam zuerst – ein Bot erfährt nichts über Anfragearten oder Felder", () => {
    const target = { ...TARGET, channels: { table: false, pickup: true } };
    expect(evaluateRequest("table", tableForm({ webseite: "x", email: "" }), target, NOW)).toEqual({ kind: "drop" });
    expect(evaluateRequest("table", tableForm({ dauer: "100" }), target, NOW)).toEqual({ kind: "retry" });
  });

  it("lehnt nicht vereinbarte Anfragearten ab", () => {
    const target = { ...TARGET, channels: { table: true, pickup: false } };
    expect(evaluateRequest("pickup", pickupForm(), target, NOW)).toEqual({ kind: "notOffered" });
  });

  it("sammelt Eingabe-, Regel- und Linkfehler", () => {
    expect(evaluateRequest("table", tableForm({ email: "" }), TARGET, NOW)).toMatchObject({ kind: "invalid", errors: { email: expect.any(String) } });
    const result = evaluateRequest("table", tableForm({ datum: "2026-09-28", nachricht: "www.werbung.example" }), TARGET, NOW);
    expect(result).toMatchObject({ kind: "invalid", errors: { datum: expect.stringMatching(/Ruhetag/), nachricht: expect.stringMatching(/Links/) } });
  });
});

describe("requestResponseSchema", () => {
  it("beschreibt alle Antworten der Route", () => {
    expect(requestResponseSchema.safeParse({ status: "sent", confirmation: "failed" }).success).toBe(true);
    expect(requestResponseSchema.safeParse({ status: "invalid", message: "x", fieldErrors: { datum: "y" } }).success).toBe(true);
    expect(requestResponseSchema.safeParse({ status: "invalid", message: "x", fieldErrors: { fremd: "y" } }).success).toBe(false);
    expect(requestResponseSchema.safeParse({ status: "limited", message: "x", retryAfterSeconds: 0 }).success).toBe(false);
  });
});

describe("Formularbeschreibung", () => {
  it("fragt nur ab, was der Betrieb braucht – mit sichtbarer Beschriftung und passendem autocomplete", () => {
    expect(REQUEST_FIELDS.table.map((field) => field.name)).toEqual(["name", "email", "telefon", "datum", "uhrzeit", "personen", "nachricht"]);
    expect(REQUEST_FIELDS.pickup.map((field) => field.name)).toEqual(["name", "email", "telefon", "datum", "uhrzeit", "bestellung"]);
    for (const field of [...REQUEST_FIELDS.table, ...REQUEST_FIELDS.pickup]) expect(field.label.length).toBeGreaterThan(2);
    expect(REQUEST_FIELDS.table.find((field) => field.name === "email")?.autoComplete).toBe("email");
  });

  it("prüft im Browser nur leere Pflichtfelder – mit denselben Texten wie der Server", () => {
    expect(missingFields("table", tableForm())).toEqual({});
    expect(missingFields("table", tableForm({ name: "  ", personen: "" }))).toEqual({ name: MISSING_MESSAGES.table.name, personen: MISSING_MESSAGES.table.personen });
    expect(Object.keys(missingFields("pickup", {})).sort()).toEqual(["bestellung", "datum", "email", "name", "uhrzeit"]);
    const server = parseRequest("pickup", {});
    expect(!server.ok && server.errors).toEqual(missingFields("pickup", {}));
  });

  it("übersetzt den Wert des Felds „art“", () => {
    expect(requestKindFromValue("tisch")).toBe("table");
    expect(requestKindFromValue("abholung")).toBe("pickup");
    expect(requestKindFromValue("table")).toBeNull();
    expect(requestKindFromValue(undefined)).toBeNull();
  });

  it("sagt nach dem Versand ehrlich, was passiert ist", () => {
    expect(sentMessage("table", "sent").text).toContain("noch keine Reservierung");
    expect(sentMessage("pickup", "failed").text).toContain("ließ sich nicht verschicken");
  });
});
