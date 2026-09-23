import { describe, expect, it } from "vitest";

import { checkStylesheet } from "@/domain/quality/design-rules";

import { themeVariables } from "./css";
import { indianBombayStory } from "./indian-bombay-story";
import { narrativeEditorialBase } from "./narrative-editorial-base";
import { createThemeRegistry, THEME_REGISTRY, ThemeRegistryError } from "./registry";
import { extendTheme, type Theme, themeProblems, themeSchema } from "./schema";

const CONFIG_AREAS = [
  "colors",
  "typography",
  "spacing",
  "container",
  "hero",
  "navigation",
  "cta",
  "menu",
  "story",
  "gallery",
  "closing",
  "mobile",
  "accessibility",
  "motion",
  "imagery",
] as const;

describe("Theme-Registry", () => {
  it("führt Basis und Mumbai-Theme, Basis zuerst", () => {
    expect(THEME_REGISTRY.ids).toEqual(["narrative-editorial-base", "indian-bombay-story"]);
    expect(THEME_REGISTRY.get("indian-bombay-story").basedOn).toBe("narrative-editorial-base");
    expect(THEME_REGISTRY.find("gibt-es-nicht")).toBeUndefined();
    expect(() => THEME_REGISTRY.get("gibt-es-nicht")).toThrow(ThemeRegistryError);
  });

  it("lehnt doppelte IDs, fehlende Basis und Themes mit Befund ab", () => {
    expect(() => createThemeRegistry([narrativeEditorialBase, narrativeEditorialBase])).toThrow(/doppelt/);
    expect(() => createThemeRegistry([indianBombayStory])).toThrow(/nicht registriert/);
    const unreadable = { ...narrativeEditorialBase, id: "zu-blass", colors: { ...narrativeEditorialBase.colors, inkMuted: "#c9c3b8" } };
    expect(() => createThemeRegistry([unreadable])).toThrow(/Nebentext auf Papier/);
  });
});

describe("Vollständige Theme-Konfiguration", () => {
  it.each(THEME_REGISTRY.list().map((theme) => [theme.id, theme] as const))("%s ist vollständig und ohne Befund", (_id, theme) => {
    expect(themeSchema.safeParse(theme).success).toBe(true);
    expect(themeProblems(theme)).toEqual([]);
    for (const area of CONFIG_AREAS) expect(theme[area], area).toBeDefined();
    expect(theme.motion.loops).toBe(0);
    expect(theme.accessibility.respectReducedMotion).toBe(true);
    expect(theme.cta.minTargetPx).toBeGreaterThanOrEqual(44);
  });

  it("übersetzt jedes Theme in CSS-Variablen ohne verbotene Muster", () => {
    for (const theme of THEME_REGISTRY.list()) {
      const variables = themeVariables(theme);
      expect(variables["--ne-paper"]).toBe(theme.colors.paper);
      expect(variables["--ne-caption-style"]).toBe(theme.typography.caption.italic ? "italic" : "normal");
      const css = `:root{${Object.entries(variables).map(([key, value]) => `${key}:${value}`).join(";")}}`;
      expect(checkStylesheet(css).filter((finding) => finding.severity === "fehler")).toEqual([]);
    }
  });
});

describe("Fehlende Pflichtfelder", () => {
  const without = (key: keyof Theme) => Object.fromEntries(Object.entries(narrativeEditorialBase).filter(([entry]) => entry !== key));

  it.each(CONFIG_AREAS)("lehnt ein Theme ohne %s ab", (area) => {
    expect(themeSchema.safeParse(without(area)).success).toBe(false);
  });

  it("lehnt einzelne fehlende Tokens ab", () => {
    const colors = Object.fromEntries(Object.entries(narrativeEditorialBase.colors).filter(([key]) => key !== "focus"));
    expect(themeSchema.safeParse({ ...narrativeEditorialBase, colors }).success).toBe(false);
    expect(themeSchema.safeParse({ ...narrativeEditorialBase, imagery: { ...narrativeEditorialBase.imagery, avoid: ["Stock"] } }).success).toBe(false);
    expect(themeSchema.safeParse({ ...narrativeEditorialBase, accessibility: { ...narrativeEditorialBase.accessibility, skipLink: false } }).success).toBe(false);
  });

  it("findet, was das Schema nicht sehen kann: falsche Kursive, fehlender Schnitt, zu viele Familien, enge Versalien", () => {
    const t = narrativeEditorialBase.typography;
    expect(themeProblems({ ...narrativeEditorialBase, typography: { ...t, caption: { ...t.caption, font: "vollkorn" } } })).toContain("Schriftrolle caption: Vollkorn hat keine echte Kursive 400");
    expect(themeProblems({ ...narrativeEditorialBase, typography: { ...t, display: { ...t.display, weight: 800 } } })[0]).toMatch(/nicht im Register/);
    expect(themeProblems({ ...narrativeEditorialBase, typography: { ...t, caption: { ...t.caption, font: "karla", italic: false } } }).join()).toMatch(/4 Schriftfamilien/);
    expect(themeProblems({ ...narrativeEditorialBase, typography: { ...t, label: { ...t.label, tracking: 0 } } }).join()).toMatch(/Versalien/);
  });
});

describe("extendTheme", () => {
  it("verschmilzt Objekte, ersetzt Listen und merkt sich die Basis", () => {
    expect(indianBombayStory.basedOn).toBe("narrative-editorial-base");
    expect(indianBombayStory.typography.text).toEqual(narrativeEditorialBase.typography.text);
    expect(indianBombayStory.typography.display.font).toBe("antonio");
    expect(indianBombayStory.typography.scale.body).toBe(narrativeEditorialBase.typography.scale.body);
    expect(indianBombayStory.navigation.items).toEqual(["story", "menu", "atmosphere", "visit"]);
  });

  it("prüft das Ergebnis vollständig", () => {
    expect(() => extendTheme(narrativeEditorialBase, { id: "kaputt", name: "Kaputt", description: "Ein Theme mit ungültiger Farbe zum Testen.", colors: { paper: "weiß" } })).toThrow();
  });

  it("hält das Mumbai-Theme eigenständig: keine gesperrten Kapitälchen-Titel, keine Kapitälchen im Display", () => {
    expect(indianBombayStory.typography.display.case).toBe("normal");
    expect(indianBombayStory.typography.display.tracking).toBeLessThan(0.04);
    expect(indianBombayStory.imagery.avoid.join(" ")).toMatch(/Klischees/);
  });
});
