import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TIFFINSTUBE_RAO_THEME, tiffinstubeRaoNarrative, tiffinstubeRaoProfile } from "@/catalog/narrative-demos/tiffinstube-rao.fixture";
import { checkPageCopy } from "@/domain/quality/copy-rules";
import { checkMarkup, checkStylesheet } from "@/domain/quality/design-rules";
import { RenderGateError } from "@/domain/quality/render-gate";
import { THEME_REGISTRY } from "@studio/design-system/themes/registry";

import { NarrativeSite } from "./narrative-site";

const here = path.dirname(fileURLToPath(import.meta.url));
const theme = THEME_REGISTRY.get(TIFFINSTUBE_RAO_THEME);
const render = (props: Partial<Parameters<typeof NarrativeSite>[0]> = {}) =>
  renderToStaticMarkup(
    <NarrativeSite theme={theme} profile={tiffinstubeRaoProfile} config={tiffinstubeRaoNarrative} context={{ kind: "showcase" }} chrome={{ overviewHref: "/beispiele" }} {...props} />,
  );

const count = (html: string, pattern: RegExp) => (html.match(pattern) ?? []).length;

describe("NarrativeSite – semantisches HTML", () => {
  const html = render();

  it("hat genau ein h1, Kopf, Hauptinhalt mit Sprungziel und Fuß", () => {
    expect(count(html, /<h1[\s>]/g)).toBe(1);
    expect(html).toMatch(/<header[^>]*class="[^"]*header/);
    expect(count(html, /<main id="inhalt"/g)).toBe(1);
    expect(html).toMatch(/<footer/);
  });

  it("beschriftet jeden Abschnitt und hält die Überschriftenfolge ohne Sprünge", () => {
    for (const [, attributes] of html.matchAll(/<section([^>]*)>/g)) {
      expect(attributes).toMatch(/aria-labelledby="|aria-label="/);
    }
    const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((match) => Number(match[1]));
    levels.forEach((level, index) => {
      if (index > 0) expect(level - (levels[index - 1] ?? 1)).toBeLessThanOrEqual(1);
    });
  });

  it("rendert die Sequenz in der konfigurierten Reihenfolge", () => {
    const order = [...html.matchAll(/data-kind="([a-z]+)"/g)].map((match) => match[1]);
    expect(order).toEqual(["hero", "claim", "story", "craft", "menu", "atmosphere", "reservation", "visit", "closing"]);
  });

  it("verknüpft jedes Formularfeld mit einem Label und sperrt das Absenden in der Demo", () => {
    for (const [, id] of html.matchAll(/<(?:input|textarea)[^>]*id="([^"]+)"/g)) expect(html).toContain(`for="${id}"`);
    expect(html).toMatch(/<button type="submit"[^>]*disabled/);
    expect(html).toContain("In dieser Demo wird nichts verschickt");
  });

  it("macht die Galerie per Tastatur erreichbar und die Kartenkategorien anspringbar", () => {
    expect(html).toMatch(/role="region" aria-label="Bildreihe zum Raum, seitlich scrollbar" tabindex="0"/);
    const categories = [...html.matchAll(/href="#(karte-[a-z-]+)"/g)].map((match) => match[1]);
    expect(categories.length).toBe(tiffinstubeRaoProfile.menu.value?.sections.length);
    for (const id of categories) expect(html).toContain(`id="${id}"`);
  });

  it("kennzeichnet die Demo, zeigt keine Emoji, Icon-Bibliotheken, Wähl- oder Kartenlinks", () => {
    expect(html).toContain("Beispielseite des Studios – dieser Betrieb ist frei erfunden.");
    expect(checkMarkup(html)).toEqual([]);
    expect(html).not.toMatch(/href="tel:|wa\.me|google\.com\/maps|<img /);
  });

  it("besteht die Copy-Regeln über alle sichtbaren Texte", () => {
    const text = html.replace(/<[^>]+>/g, "\n").split("\n").map((line) => line.trim()).filter(Boolean);
    expect(checkPageCopy(text).filter((finding) => finding.severity === "fehler")).toEqual([]);
  });
});

describe("NarrativeSite – primärer CTA", () => {
  const html = render();

  it("führt überall dieselbe primäre Handlung mit demselben Ziel", () => {
    const primaries = [...html.matchAll(/<a class="[^"]*ctaPrimary[^"]*"[^>]*href="([^"]+)"[^>]*>([^<]+)</g)];
    expect(primaries.length).toBeGreaterThanOrEqual(3); // Eingang, mobiles Menü, Abschluss
    expect(new Set(primaries.map((match) => match[2]))).toEqual(new Set(["Tisch anfragen"]));
    expect(new Set(primaries.map((match) => match[1]))).toEqual(new Set(["#reservieren"]));
    expect(html).toContain('id="reservieren"');
  });

  it("stellt im Eingang genau einen primären und einen zweiten Weg bereit", () => {
    const hero = html.slice(html.indexOf('data-kind="hero"'), html.indexOf('data-kind="claim"'));
    expect(count(hero, /ctaPrimary/g)).toBe(1);
    expect(count(hero, /ctaSecondary/g)).toBe(1);
    expect(hero).toContain('href="#karte"');
  });

  it("ohne Formular als Ziel fällt die Anfrage weg und der Weg führt zum Anruf", () => {
    const withCall = render({ config: { ...tiffinstubeRaoNarrative, primaryAction: "call" } });
    expect(withCall).not.toContain('id="reservieren"');
    expect(withCall).toMatch(/ctaPrimary[^>]*href="#anfahrt"[^>]*>Anrufen</);
  });
});

describe("NarrativeSite – mobile Navigation", () => {
  const html = render();

  it("hat ein ohne JavaScript bedienbares Menü mit allen Zielen und der Handlung", () => {
    const sheet = html.slice(html.indexOf("<details"), html.indexOf("</details>"));
    expect(sheet).toMatch(/<summary[^>]*>Menü<\/summary>/);
    expect(sheet).toContain('aria-label="Hauptnavigation (mobil)"');
    for (const anchor of ["#geschichte", "#karte", "#raum", "#anfahrt"]) expect(sheet).toContain(`href="${anchor}"`);
    expect(sheet).toContain("Tisch anfragen");
  });

  it("rendert die Handlungsleiste zunächst verborgen und nicht fokussierbar (erscheint erst mit Skript)", () => {
    expect(html).toMatch(/<nav class="[^"]*bar[^"]*" aria-label="Schnellzugriff" data-hidden="true" inert=""/);
  });
});

describe("NarrativeSite – Fakten-Gate und Stylesheet", () => {
  it("verweigert erfundene Angaben auf der Seite eines echten Betriebs", () => {
    expect(() => render({ context: { kind: "leadDemo" } })).toThrow(RenderGateError);
  });

  it("hält die Musterregeln ein und enthält keine Farbwerte außerhalb der Tokens", () => {
    const css = readFileSync(path.join(here, "narrative.module.css"), "utf8");
    expect(checkStylesheet(css).filter((finding) => finding.severity === "fehler")).toEqual([]);
    expect(css.replace(/\/\*[\s\S]*?\*\//g, "").match(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/gi) ?? []).toEqual([]);
  });

  it("bewegt nichts ohne Freigabe: jede Animation steht unter prefers-reduced-motion: no-preference", () => {
    const css = readFileSync(path.join(here, "narrative.module.css"), "utf8");
    const [beforeMotion = "", motion = ""] = css.split("@media (prefers-reduced-motion: no-preference)");
    expect(beforeMotion).not.toMatch(/animation\s*:/);
    expect(motion).toMatch(/animation-timeline/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*transition-duration: 0s/);
  });
});
