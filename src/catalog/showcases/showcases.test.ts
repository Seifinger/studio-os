import { describe, expect, it } from "vitest";

import { checkSignatures, creativeDirectionProblems } from "@/domain/design/creative-direction";
import { resolveImageSlot } from "@/domain/design/image-plan";
import { CUISINE_IDS } from "@/domain/gastronomy/cuisines";
import { auditFacts } from "@/domain/provenance/gate";
import { checkCopy, checkPageCopy } from "@/domain/quality/copy-rules";
import { assertRenderable } from "@/domain/quality/render-gate";

import { DIRECTIONS } from "../directions";
import { defineShowcase, ShowcaseError, week } from "./define";
import { SHOWCASES, showcaseBySlug } from "./index";
import { kramerwirt } from "./houses/kramerwirt";

/** Alle Texte, die ein Gast auf der Seite liest. */
function guestTexts(showcase: (typeof SHOWCASES)[number]): string[] {
  const { profile, creative } = showcase;
  const texts: (string | undefined)[] = [
    profile.name.value ?? undefined,
    profile.conceptShort.value ?? undefined,
    profile.story.value ?? undefined,
    profile.usp.value ?? undefined,
    profile.openingHours.value?.note,
    profile.menu.value?.note,
    ...(profile.specials.value ?? []),
    ...(profile.signatureDishes.value ?? []),
    ...(profile.serviceNotes.value ?? []),
    ...(profile.menu.value?.sections.flatMap((section) => [section.title, section.note, ...section.items.flatMap((item) => [item.name, item.description])]) ?? []),
    ...creative.dramaturgy.map((entry) => entry.title),
    ...showcase.imageSlots.flatMap((slot) => [slot.motif, slot.alt]),
  ];
  return texts.filter((text): text is string => typeof text === "string");
}

describe("Beispielbetriebe", () => {
  it.each(SHOWCASES.map((showcase) => [showcase.slug, showcase] as const))("%s besteht Fakten-Gate, Creative Direction und Copy-Regeln", (_slug, showcase) => {
    const audit = assertRenderable(showcase.profile, { kind: "showcase" });
    expect(audit.violations).toEqual([]);
    // Nur erfundene Angaben – nie etwas, das nach einem echten Betrieb aussieht.
    for (const fact of Object.values(showcase.profile)) expect(["fiktiv", "unbekannt"]).toContain(fact.status);

    expect(creativeDirectionProblems(showcase.creative)).toEqual([]);
    expect(checkSignatures(showcase.creative, showcase.profile, { kind: "showcase" }).dropped).toEqual([]);

    const findings = checkPageCopy(guestTexts(showcase)).filter((finding) => finding.severity === "fehler");
    expect(findings.map((finding) => `${finding.ruleId}: ${finding.match}`)).toEqual([]);
    expect(checkCopy(showcase.direction.mood).filter((finding) => finding.severity === "fehler")).toEqual([]);
  });

  it.each(SHOWCASES.map((showcase) => [showcase.slug, showcase] as const))("%s zeigt keine Bilder ohne eigenes, freigegebenes Foto", (_slug, showcase) => {
    for (const slot of showcase.imageSlots) expect(resolveImageSlot(slot).show).toBe("slot");
    const sections = showcase.creative.dramaturgy.map((entry) => entry.section);
    if (showcase.direction.layout.gallery === "none") expect(sections).not.toContain("imageSlots");
    if (sections.includes("imageSlots")) expect(showcase.imageSlots.length).toBeGreaterThanOrEqual(2);
  });

  it.each(SHOWCASES.map((showcase) => [showcase.slug, showcase] as const))("%s zeigt die Tageskarte im Split-Hero, nicht doppelt als eigenen Abschnitt", (_slug, showcase) => {
    const sections = showcase.creative.dramaturgy.map((entry) => entry.section);
    if (showcase.direction.layout.hero === "split-editorial") expect(sections).not.toContain("specials");
  });

  it("hat genau ein Haus je Küche und Design Direction (Tauschprobe)", () => {
    expect(SHOWCASES.map((showcase) => showcase.profile.cuisine.value).toSorted()).toEqual([...CUISINE_IDS].toSorted());
    expect(new Set(SHOWCASES.map((showcase) => showcase.direction.id)).size).toBe(DIRECTIONS.length);
    for (const showcase of SHOWCASES) expect(showcase.direction.cuisines).toContain(showcase.profile.cuisine.value);
  });

  it("vergibt Slugs, Namen und Telefonnummern nur einmal", () => {
    const unique = (values: readonly unknown[]) => new Set(values).size === values.length;
    expect(unique(SHOWCASES.map((showcase) => showcase.slug))).toBe(true);
    expect(unique(SHOWCASES.map((showcase) => showcase.profile.name.value))).toBe(true);
    expect(unique(SHOWCASES.map((showcase) => showcase.profile.phone.value?.e164))).toBe(true);
  });

  it("variiert die Dramaturgie: keine zwei Häuser mit derselben Abschnittsfolge", () => {
    const orders = SHOWCASES.map((showcase) => showcase.creative.dramaturgy.map((entry) => entry.section).join(">"));
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("findet Häuser über den Slug", () => {
    expect(showcaseBySlug("trattoria-da-paola")?.profile.name.value).toBe("Trattoria da Paola");
    expect(showcaseBySlug("gibt-es-nicht")).toBeUndefined();
  });
});

describe("defineShowcase", () => {
  const base = {
    slug: "test-haus",
    direction: "wirtshaus-stadtplatz" as const,
    facts: { name: "Testhaus", cuisine: "bayerisch" as const },
    creative: {
      idea: "Eine Idee für ein Testhaus.",
      effect: "Man sieht, was es ist.",
      metaphor: "Ein Zettel an der Tür.",
      dramaturgy: [
        { section: "hero" as const, weight: "gross" as const, why: "Der Name steht vorn." },
        { section: "menu" as const, weight: "normal" as const, why: "Die Karte folgt." },
        { section: "visit" as const, weight: "normal" as const, why: "Der Weg zum Haus." },
      ],
      signatures: [],
      omissions: ["Keine Stockfotos"],
    },
    imageSlots: [],
  };

  it("macht jede Angabe fiktiv und lässt Fehlendes unbekannt", () => {
    const showcase = defineShowcase(base);
    expect(showcase.profile.name).toEqual({ status: "fiktiv", value: "Testhaus" });
    expect(showcase.profile.menu).toEqual({ status: "unbekannt", value: null });
    expect(auditFacts(showcase.profile, { kind: "leadDemo" }).violations.map((v) => v.field)).toEqual(["name", "cuisine"]);
  });

  it("lehnt echte Telefonnummern ab – nur der Bereich 089 99998 1xx ist erlaubt", () => {
    expect(() => defineShowcase({ ...base, facts: { ...base.facts, phone: "08631 12345" } })).toThrow(ShowcaseError);
    expect(() => defineShowcase({ ...base, facts: { ...base.facts, phone: "089 99998 201" } })).toThrow(ShowcaseError);
    expect(defineShowcase({ ...base, facts: { ...base.facts, phone: "089 99998 150" } }).profile.phone.value?.e164).toBe("+4989999981" + "50");
  });

  it("lehnt vergebene Postleitzahlen ab", () => {
    const address = { street: "Hauptstraße 1", postalCode: "80331", locality: "München" };
    expect(() => defineShowcase({ ...base, facts: { ...base.facts, address } })).toThrow(/Postleitzahlen mit 00/);
  });

  it("bricht bei ungültigen Angaben, Creative Directions oder Slugs ab", () => {
    expect(() => defineShowcase({ ...base, slug: "Kein Slug" })).toThrow(ShowcaseError);
    expect(() => defineShowcase({ ...base, facts: { ...base.facts, story: "" } })).toThrow(/Profil ungültig/);
    expect(() => defineShowcase({ ...base, creative: { ...base.creative, dramaturgy: base.creative.dramaturgy.slice(1) } })).toThrow(/Creative Direction ungültig/);
  });

  it("baut Wochenpläne aus kurzer Schreibweise; nicht genannte Tage sind Ruhetage", () => {
    expect(week({ di: "11:30-14:00 17:30-22:00" }, "Küche bis 21 Uhr")).toEqual({
      week: { mo: [], di: [{ from: "11:30", to: "14:00" }, { from: "17:30", to: "22:00" }], mi: [], do: [], fr: [], sa: [], so: [] },
      note: "Küche bis 21 Uhr",
    });
    expect(kramerwirt.profile.openingHours.value?.week.mo).toEqual([]);
  });
});
