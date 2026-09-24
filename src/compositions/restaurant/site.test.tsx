import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SHOWCASES } from "@/catalog/showcases";
import { FONT_FAMILIES, fontStylesheets } from "@/domain/design/fonts";
import type { Fact } from "@/domain/provenance/fact";
import { checkMarkup, checkStylesheet } from "@/domain/quality/design-rules";
import { RenderGateError } from "@/domain/quality/render-gate";

import type { RenderProfile, SiteModel } from "./model";
import { RestaurantSite, siteActions } from "./site";
import { themeStyle } from "./theme";

const here = path.dirname(fileURLToPath(import.meta.url));
function firstShowcase() {
  const showcase = SHOWCASES[0];
  if (!showcase) throw new Error("Kein Beispielbetrieb im Katalog");
  return showcase;
}
const first = firstShowcase();

const showcaseModel = (showcase = first): SiteModel => ({
  context: { kind: "showcase" },
  profile: showcase.profile,
  direction: showcase.direction,
  creative: showcase.creative,
  imageSlots: showcase.imageSlots,
});

const UNKNOWN_FACT = { status: "unbekannt", value: null } as const;

/** Ein echter Betrieb, über den nur der Name bekannt ist – so beginnt jede Lead-Demo. */
function leadModel(): SiteModel {
  const profile = Object.fromEntries(Object.keys(first.profile).map((key) => [key, UNKNOWN_FACT])) as unknown as RenderProfile;
  const name: Fact<string> = { status: "uebernommen", value: "Gasthof Beispiel", source: { kind: "googlePlacesLive", placeId: "abc", retrievedAt: "2026-09-23T10:00:00Z" }, recordedAt: "2026-09-23" };
  return { ...showcaseModel(), context: { kind: "leadDemo" }, profile: { ...profile, name } };
}

describe("RestaurantSite", () => {
  it("rendert jede Beispielseite mit Pflichthinweis, ohne Emoji und ohne Icon-Bibliothek", () => {
    for (const showcase of SHOWCASES) {
      const html = renderToStaticMarkup(<RestaurantSite model={showcaseModel(showcase)} />);
      expect(html).toContain("Beispielseite des Studios – dieser Betrieb ist frei erfunden.");
      expect(html).toContain('id="inhalt"');
      expect(checkMarkup(html)).toEqual([]);
      // Erfundene Nummern werden nie wählbar, erfundene Adressen nie zur Route.
      expect(html).not.toMatch(/href="tel:|wa\.me|google\.com\/maps/);
    }
  });

  it("ordnet die Abschnitte nach der Dramaturgie der Creative Direction", () => {
    const html = renderToStaticMarkup(<RestaurantSite model={showcaseModel()} />);
    const ids = first.creative.dramaturgy.map((entry) => entry.section);
    const positions = ids
      .map((section) => ({ section, index: html.indexOf(`data-section="${section}"`) }))
      .filter((entry) => entry.index >= 0);
    expect(positions.map((entry) => entry.section)).toEqual(ids.filter((id) => positions.some((entry) => entry.section === id)));
    expect(positions.length).toBeGreaterThanOrEqual(ids.length - 1);
  });

  it("zeigt in Lead-Demos Platzhalter mit Briefing-Frage und die Google-Quellenangabe", () => {
    const html = renderToStaticMarkup(<RestaurantSite model={leadModel()} />);
    expect(html).toContain("Konzeptentwurf des Studios – nicht die offizielle Website von Gasthof Beispiel.");
    expect(html).toContain("Hier steht Ihre Speisekarte");
    expect(html).toContain("Frage fürs Gespräch:");
    expect(html).toContain("Google Maps");
  });

  it("verweigert das Rendern, wenn eine erfundene Angabe auf der Seite eines echten Betriebs landen würde", () => {
    const model: SiteModel = { ...showcaseModel(), context: { kind: "leadDemo" } };
    expect(() => renderToStaticMarkup(<RestaurantSite model={model} />)).toThrow(RenderGateError);
  });

  it("macht erfundene Anruf-Knöpfe zu Sprüngen auf die Besuchs-Sektion statt zu tel:-Links", () => {
    const actions = siteActions(showcaseModel());
    expect(actions.primary).not.toBeNull();
    for (const action of [...actions.hero, ...actions.bar]) {
      expect(action.href.startsWith("#")).toBe(true);
    }
    expect(actions.visit.every((action) => action.href !== "#besuch")).toBe(true);
  });
});

describe("Stylesheets der Komposition", () => {
  const cssFiles = [
    ...readdirSync(here).filter((file) => file.endsWith(".css")).map((file) => path.join(here, file)),
    path.join(here, "../../app/beispiele/overview.module.css"),
  ];

  it.each(cssFiles.map((file) => [path.basename(file), file] as const))("%s hält die Musterregeln S1–S7 ein", (_name, file) => {
    const findings = checkStylesheet(readFileSync(file, "utf8")).filter((finding) => finding.severity === "fehler");
    expect(findings).toEqual([]);
  });

  it.each(cssFiles.map((file) => [path.basename(file), file] as const))("%s nutzt nur Theme-Variablen, die es gibt", (_name, file) => {
    const defined = new Set(Object.keys(themeStyle(first.direction)));
    const used = [...readFileSync(file, "utf8").matchAll(/var\((--(?:c|f|w|s|label)-[a-z0-9-]+|--radius)\b/g)].map((match) => match[1] ?? "");
    expect([...new Set(used)].filter((name) => !defined.has(name))).toEqual([]);
  });

  it.each(cssFiles.map((file) => [path.basename(file), file] as const))("%s enthält keine Farbwerte außerhalb der Tokens", (_name, file) => {
    const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(css.match(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/gi) ?? []).toEqual([]);
  });

  it("hat höchstens einen Bewegungsmoment je Intensität (DESIGN.md §7)", () => {
    const css = readFileSync(path.join(here, "site.module.css"), "utf8");
    expect(css.match(/data-motion="editorial"\][^{]*\{\s*animation:/g) ?? []).toHaveLength(1);
    expect(css.match(/data-motion="expressive"\][^{]*\{\s*animation:/g) ?? []).toHaveLength(1);
    expect(css).not.toMatch(/data-motion="quiet"/);
  });

  it("schaltet jede Bewegung bei reduzierter Bewegung ab", () => {
    const css = readFileSync(path.join(here, "site.module.css"), "utf8");
    const outsideMedia = css.split("@media (prefers-reduced-motion: no-preference)")[0] ?? "";
    expect(outsideMedia).not.toMatch(/animation\s*:/);
  });
});

describe("Schriftdateien", () => {
  it("bindet genau die Schnitte des Schriftregisters ein", () => {
    const source = readFileSync(path.join(here, "font-faces.ts"), "utf8");
    const imported = [...source.matchAll(/^import "([^"]+)";$/gm)].map((match) => match[1]);
    const registry = FONT_FAMILIES.flatMap((font) => fontStylesheets(font.id));
    expect(imported.toSorted()).toEqual(registry.toSorted());
  });
});
