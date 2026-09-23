import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { FONT_FAMILIES, fontStack, fontStylesheets, registryProblems } from "./fonts";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const pkg = JSON.parse(readFileSync(`${root}package.json`, "utf8")) as { dependencies: Record<string, string> };

describe("Schriftregister", () => {
  it("enthält keine verbotene Schrift (S1)", () => {
    expect(registryProblems()).toEqual([]);
  });

  it("hat eindeutige IDs und Familien", () => {
    expect(new Set(FONT_FAMILIES.map((f) => f.id)).size).toBe(FONT_FAMILIES.length);
    expect(new Set(FONT_FAMILIES.map((f) => f.family)).size).toBe(FONT_FAMILIES.length);
  });

  it.each(FONT_FAMILIES.map((font) => [font.id, font] as const))("%s ist exakt gepinnt, OFL-lizenziert und installiert", (_id, font) => {
    expect(pkg.dependencies[font.package], `${font.package} fehlt in package.json`).toMatch(/^\d+\.\d+\.\d+$/);
    const manifest = JSON.parse(readFileSync(`${root}node_modules/${font.package}/package.json`, "utf8")) as { license: string };
    expect(manifest.license).toBe(font.license);
    for (const sheet of fontStylesheets(font.id)) {
      expect(existsSync(`${root}node_modules/${sheet}`), sheet).toBe(true);
      expect(readFileSync(`${root}node_modules/${sheet}`, "utf8")).toContain(`font-family: '${font.family}'`);
    }
  });

  it("liefert Stapel mit Rückfallschrift und lädt große CJK-Schriften nur lateinisch", () => {
    expect(fontStack("vollkorn")).toBe('"Vollkorn", Georgia, "Times New Roman", serif');
    expect(fontStylesheets("zen-kaku-gothic-new")).toEqual([
      "@fontsource/zen-kaku-gothic-new/latin-400.css",
      "@fontsource/zen-kaku-gothic-new/latin-700.css",
    ]);
  });
});
