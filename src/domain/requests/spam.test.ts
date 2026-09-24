import { describe, expect, it } from "vitest";

import { pickupForm, tableForm } from "../../../tests/support/request-fixtures";
import { parseRequest } from "./parse";
import { linkErrors, MIN_FILL_MS, spamVerdict } from "./spam";

describe("spamVerdict", () => {
  it("lässt normale Anfragen durch – auch ohne Dauer (Browser ohne JavaScript)", () => {
    expect(spamVerdict(tableForm())).toEqual({ kind: "clean" });
    expect(spamVerdict(tableForm({ dauer: undefined }))).toEqual({ kind: "clean" });
    expect(spamVerdict(tableForm({ dauer: "" }))).toEqual({ kind: "clean" });
  });

  it("verwirft Anfragen mit gefülltem Honigtopf still", () => {
    expect(spamVerdict(tableForm({ webseite: "https://werbung.example" }))).toEqual({ kind: "drop" });
  });

  it(`bittet bei weniger als ${MIN_FILL_MS} ms oder unlesbarer Dauer um erneutes Senden`, () => {
    expect(spamVerdict(tableForm({ dauer: String(MIN_FILL_MS - 1) }))).toEqual({ kind: "retry" });
    expect(spamVerdict(tableForm({ dauer: "abc" }))).toEqual({ kind: "retry" });
    expect(spamVerdict(tableForm({ dauer: String(MIN_FILL_MS) }))).toEqual({ kind: "clean" });
  });
});

describe("linkErrors", () => {
  const parsed = (form: ReturnType<typeof tableForm>, kind: "table" | "pickup" = "table") => {
    const result = parseRequest(kind, form);
    if (!result.ok) throw new Error("Testdaten ungültig");
    return result.request;
  };

  it("findet Links in Name, Anmerkung und Bestellung", () => {
    expect(linkErrors(parsed(tableForm({ nachricht: "Siehe https://werbung.example" })))).toHaveProperty("nachricht");
    expect(linkErrors(parsed(tableForm({ name: "www.werbung.example" })))).toHaveProperty("name");
    expect(linkErrors(parsed(pickupForm({ bestellung: "[url=x]billig[/url]" }), "pickup"))).toHaveProperty("bestellung");
  });

  it("lässt normale Texte mit Punkten und Mailadressen in Ruhe", () => {
    expect(linkErrors(parsed(tableForm({ nachricht: "Geburtstag, bitte ruhiger Tisch. Danke!" })))).toEqual({});
  });
});
