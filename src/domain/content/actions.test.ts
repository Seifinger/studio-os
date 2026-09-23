import { describe, expect, it } from "vitest";

import type { Fact } from "../provenance/fact";
import type { GateContext } from "../provenance/gate";
import { ACTION_LABELS, ACTION_TYPES, type ActionSources, resolveAction } from "./actions";

const source = { kind: "business", note: "Gespräch" } as const;
const confirmed = <T>(value: T): Fact<T> => ({ status: "bestaetigt", value, source, recordedAt: "2026-09-23" });
const proposed = <T>(value: T): Fact<T> => ({ status: "vorschlag", value, by: "studio" });
const unknown: Fact<never> = { status: "unbekannt", value: null };

const phone = { e164: "+49863112345", display: "08631 12345" };
const address = { street: "Stadtplatz 1", postalCode: "84453", locality: "Mühldorf am Inn" };

const complete: ActionSources = {
  phone: confirmed(phone),
  whatsapp: confirmed(phone),
  address: confirmed(address),
  email: confirmed("anfragen@zur-linde.de"),
  onlineBooking: confirmed({ provider: "quandoo" as const, url: "https://www.quandoo.de/place/zur-linde" }),
  requestChannels: confirmed({ table: true, pickup: false }),
  menu: confirmed({ sections: [] }),
};
const empty: ActionSources = {
  phone: unknown,
  whatsapp: unknown,
  address: unknown,
  email: unknown,
  onlineBooking: unknown,
  requestChannels: unknown,
  menu: unknown,
};

const live: GateContext = { kind: "customer", stage: "live" };
const preview: GateContext = { kind: "customer", stage: "preview" };
const leadDemo: GateContext = { kind: "leadDemo" };

describe("resolveAction mit vollständigen, bestätigten Angaben", () => {
  it.each([
    ["call", "tel:+49863112345", false],
    ["whatsapp", "https://wa.me/49863112345", true],
    ["directions", "https://www.google.com/maps/search/?api=1&query=Stadtplatz%201%2C%2084453%20M%C3%BChldorf%20am%20Inn", true],
    ["onlineBooking", "https://www.quandoo.de/place/zur-linde", true],
    ["tableRequest", "#tisch-anfragen", false],
    ["menu", "#speisekarte", false],
  ] as const)("%s → %s", (type, href, external) => {
    expect(resolveAction(type, complete, live)).toMatchObject({ available: true, href, external, draft: false, demoOnly: false });
  });

  it("nennt den Anbieter des Reservierungssystems", () => {
    expect(resolveAction("onlineBooking", complete, live)).toMatchObject({ label: "Online reservieren über Quandoo" });
  });

  it("bietet nur vereinbarte Anfragearten an", () => {
    expect(resolveAction("pickupRequest", complete, live)).toEqual({
      available: false,
      type: "pickupRequest",
      reason: "Diese Anfrageart ist nicht vereinbart",
    });
  });

  it("braucht für Anfragen eine freigegebene E-Mail-Adresse", () => {
    expect(resolveAction("tableRequest", { ...complete, email: unknown }, live)).toMatchObject({
      available: false,
      reason: "Keine freigegebene E-Mail-Adresse für Anfragen",
    });
  });
});

describe("resolveAction ohne Angaben", () => {
  it.each(ACTION_TYPES.filter((type) => type !== "tableRequest" && type !== "pickupRequest"))(
    "%s ist beim Kunden nicht verfügbar",
    (type) => {
      expect(resolveAction(type, empty, live).available).toBe(false);
    },
  );

  it("macht in Demos aus Anfragen ein Formular, das nichts verschickt", () => {
    expect(resolveAction("tableRequest", empty, leadDemo)).toMatchObject({ available: true, demoOnly: true });
    expect(resolveAction("pickupRequest", empty, { kind: "showcase" })).toMatchObject({ available: true, demoOnly: true });
  });

  it("springt in Demos auch zum Platzhalter der Speisekarte", () => {
    expect(resolveAction("menu", empty, leadDemo)).toMatchObject({ available: true, href: "#speisekarte" });
  });

  it("macht aus einer unbekannten Telefonnummer auch in Demos keinen Anruf-Knopf", () => {
    expect(resolveAction("call", empty, leadDemo)).toMatchObject({ available: false, reason: "Keine freigegebene Telefonnummer" });
  });

  it("meldet fehlende Speisekarte bei Betrieben ohne Karte", () => {
    const withoutMenu: ActionSources = { ...complete, menu: undefined };
    expect(resolveAction("menu", withoutMenu, live)).toMatchObject({ available: false, reason: "Dieses Profil hat keine Speisekarte" });
  });
});

describe("Vorschläge", () => {
  it("sind in der Vorschau als Entwurf markiert und live nicht verfügbar", () => {
    const sources = { ...complete, phone: proposed(phone) };
    expect(resolveAction("call", sources, preview)).toMatchObject({ available: true, draft: true });
    expect(resolveAction("call", sources, live).available).toBe(false);
  });
});

describe("ACTION_LABELS", () => {
  it("beschriftet ehrlich: eine Anfrage ist keine Reservierung", () => {
    expect(ACTION_LABELS.tableRequest).toBe("Tisch anfragen");
    expect(ACTION_LABELS.tableRequest).not.toMatch(/reservier/i);
    expect(ACTION_LABELS.pickupRequest).not.toMatch(/bestell/i);
    // „reservieren“ nur dort, wo ein echtes Buchungssystem dahintersteht.
    expect(ACTION_LABELS.onlineBooking).toBe("Online reservieren");
  });
});
