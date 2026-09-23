import { describe, expect, it } from "vitest";

import { checkCopy, checkPageCopy, COPY_RULES, proposeCopy } from "./copy-rules";

const ids = (text: string) => checkCopy(text).map((finding) => finding.ruleId);

describe("checkCopy – erkennt KI-Floskeln", () => {
  it.each([
    ["Willkommen bei Trattoria Rossi! Holzofenpizza seit 1998.", "willkommen"],
    ["Herzlich Willkommen im Gasthaus. Wir kochen bayerisch.", "willkommen"],
    ["Tauchen Sie ein in die Welt Italiens.", "eintauchen"],
    ["Lassen Sie sich von unserer Küche verwöhnen.", "verwoehnen"],
    ["Entdecken Sie unsere Karte.", "entdecken-erleben"],
    ["Eine kulinarische Reise durch Anatolien.", "kulinarische-reise"],
    ["Ein kulinarisches Erlebnis für die ganze Familie.", "kulinarisches-erlebnis"],
    ["Ein echtes Geschmackserlebnis.", "geschmackserlebnis"],
    ["Der Holzofen ist das Herzstück.", "herzstueck"],
    ["Eine Oase der Ruhe am Stadtplatz.", "oase"],
    ["Alles mit viel Liebe gekocht.", "mit-liebe"],
    ["Wir bieten nicht nur Pizza, sondern auch Pasta.", "nicht-nur-sondern"],
    ["Bodenständig, ehrlich und frisch.", "adjektiv-kette"],
    ["Ein unvergesslicher Abend.", "superlativ-unvergesslich"],
    ["Authentische italienische Küche.", "superlativ-authentisch"],
    ["Die perfekten Nudeln.", "superlativ-perfekt"],
    ["Ein Hauch Dolce Vita.", "klischee-dolce-vita"],
    ["Mediterrane Gastfreundschaft seit 1985.", "klischee-gastfreundschaft"],
    ["Das ist wirklich gut.", "fuellwort"],
    ["Pasta — frisch gemacht.", "geviertstrich"],
    ["Die beste Pizza der Stadt.", "superlativ-beste"],
    ["Egal ob mittags oder abends.", "egal-ob"],
    ["Komm vorbei!", "duzen"],
    ["Für alle Food Lover.", "englisch"],
  ])("%s → %s", (text, ruleId) => {
    expect(ids(text)).toContain(ruleId);
  });
});

describe("checkCopy – lässt konkrete Sprache in Ruhe", () => {
  it.each([
    "Holzofenpizza seit 1998, Teig mit 48 Stunden Ruhe.",
    "Das Willkommensgetränk ist ein Hollerspritz.",
    "Perfektionist in der Küche ist Anna Huber.",
    "Die Wirklichkeit: Donnerstag ist Ruhetag.",
    "Frische Pasta von Hand gerollt, jeden Mittag.",
    "Weißwürste bis 12:00 Uhr, dazu süßer Senf.",
    "Mittags und abends geöffnet – dienstags Ruhetag.",
    "Kaiserschmarrn aus der Pfanne, mit Apfelmus.",
    "Wir sind ein Wirtshaus am Stadtplatz.",
  ])("%s", (text) => {
    expect(checkCopy(text)).toEqual([]);
  });

  it("zählt Umlaute als Wortbestandteil (kein Treffer mitten im Wort)", () => {
    expect(ids("Übereinzigartigkeit")).toEqual([]);
    expect(ids("einzigartig")).toEqual(["superlativ-einzigartig"]);
  });
});

describe("checkCopy – Befunde", () => {
  it("liefert Position, Begründung und Vorschlag", () => {
    const [finding] = checkCopy("Alles mit viel Liebe gekocht.");
    expect(finding).toMatchObject({
      ruleId: "mit-liebe",
      severity: "fehler",
      match: "mit viel Liebe gekocht",
      index: 6,
      suggestion: "von Hand gekocht",
    });
    expect(finding?.reason.length).toBeGreaterThan(10);
  });

  it("hat eindeutige Regel-IDs mit Begründung", () => {
    const all = COPY_RULES.map((rule) => rule.id);
    expect(new Set(all).size).toBe(all.length);
    for (const rule of COPY_RULES) {
      expect(rule.pattern.flags).toContain("g");
      expect(rule.reason).not.toBe("");
    }
  });
});

describe("checkPageCopy", () => {
  it("erlaubt höchstens ein Ausrufezeichen je Seite", () => {
    expect(checkPageCopy(["Heute Spargel!", "Montag Ruhetag."])).toEqual([]);
    expect(checkPageCopy(["Heute Spargel!", "Jetzt anrufen!"]).map((finding) => finding.ruleId)).toEqual(["ausrufezeichen"]);
  });
});

describe("proposeCopy", () => {
  it.each([
    ["Willkommen bei Trattoria Rossi! Holzofenpizza seit 1998.", "Holzofenpizza seit 1998."],
    ["Entdecken Sie unsere Karte.", "Unsere Karte."],
    ["Alles mit viel Liebe gekocht.", "Alles von Hand gekocht."],
    ["Wir bieten nicht nur Pizza, sondern auch Pasta.", "Wir bieten Pizza und Pasta."],
    ["Authentische Küche aus Kalabrien.", "Küche aus Kalabrien."],
    ["Pasta — frisch.", "Pasta – frisch."],
  ])("%s → %s", (input, expected) => {
    expect(proposeCopy(input).text).toBe(expected);
  });

  it("nennt die angewendeten Regeln und lässt Hinweise unangetastet", () => {
    const result = proposeCopy("Die beste Pizza der Stadt, mit viel Liebe gemacht.");
    expect(result.appliedRules).toEqual(["mit-liebe"]);
    expect(result.text).toBe("Die beste Pizza der Stadt, von Hand gemacht.");
  });

  it("gibt konkrete Texte unverändert zurück", () => {
    expect(proposeCopy("Weißwürste bis 12:00 Uhr.")).toEqual({ text: "Weißwürste bis 12:00 Uhr.", appliedRules: [] });
  });
});
