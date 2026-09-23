import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { contrastRatio, WCAG_AA } from "@/domain/color/contrast";

// Prüft das Studio-Token-Set aus globals.css gegen WCAG 2.2 AA und gegen die
// Tabelle in DESIGN.md, Abschnitt 9 – damit Dokument und Code nicht auseinanderlaufen.

const read = (relative: string) => readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");

type Tokens = Record<string, string>;

function tokensFromCss(css: string): { light: Tokens; dark: Tokens } {
  const blocks = [...css.matchAll(/:root\s*\{([^}]*)\}/g)].map((match) => match[1] ?? "");
  const parse = (block: string): Tokens =>
    Object.fromEntries(
      [...block.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map((m) => [m[1], m[2]?.toLowerCase()]),
    );
  const [light = "", dark = ""] = blocks;
  return { light: parse(light), dark: parse(dark) };
}

function tokensFromDesignDoc(markdown: string): { light: Tokens; dark: Tokens } {
  const rows = [...markdown.matchAll(/^\| `([a-z-]+)` \| `(#[0-9a-f]{6})` \| `(#[0-9a-f]{6})` \|/gim)];
  return {
    light: Object.fromEntries(rows.map((m) => [m[1], m[2]?.toLowerCase()])),
    dark: Object.fromEntries(rows.map((m) => [m[1], m[3]?.toLowerCase()])),
  };
}

const css = tokensFromCss(read("./globals.css"));
const doc = tokensFromDesignDoc(read("../../DESIGN.md"));

// [Vordergrund, Hintergrund, Mindestkontrast, Aufgabe]
const REQUIRED_PAIRS: readonly (readonly [string, string, number, string])[] = [
  ["ink", "paper", 7, "Text auf Grund (AAA angestrebt)"],
  ["ink", "surface", 7, "Text auf Fläche"],
  ["ink-muted", "paper", WCAG_AA.text, "Nebentext auf Grund"],
  ["ink-muted", "surface", WCAG_AA.text, "Nebentext auf Fläche"],
  ["accent", "paper", WCAG_AA.text, "Links auf Grund"],
  ["accent", "surface", WCAG_AA.text, "Links auf Fläche"],
  ["on-accent", "accent", WCAG_AA.text, "Schrift auf Primärknopf"],
  ["line-strong", "paper", WCAG_AA.nonText, "Grenzen von Bedienelementen"],
  ["line-strong", "surface", WCAG_AA.nonText, "Grenzen von Bedienelementen auf Fläche"],
  ["ok", "paper", WCAG_AA.text, "Zustand in Ordnung"],
  ["fail", "paper", WCAG_AA.text, "Zustand Fehler"],
];

describe.each([
  ["hell", css.light],
  ["dunkel", css.dark],
] as const)("Studio-Tokens (%s)", (_scheme, tokens) => {
  it("definiert jedes Token genau einmal als Hex-Farbe", () => {
    expect(Object.keys(tokens).sort()).toEqual(Object.keys(css.light).sort());
    expect(Object.keys(tokens).length).toBeGreaterThanOrEqual(10);
  });

  it.each(REQUIRED_PAIRS)("%s auf %s erreicht mindestens %s:1 (%s)", (fg, bg, minimum) => {
    const foreground = tokens[fg];
    const background = tokens[bg];
    expect(foreground, `Token ${fg} fehlt`).toBeDefined();
    expect(background, `Token ${bg} fehlt`).toBeDefined();
    expect(contrastRatio(foreground ?? "", background ?? "")).toBeGreaterThanOrEqual(minimum);
  });
});

describe("DESIGN.md, Abschnitt 9", () => {
  it("nennt dieselben Werte wie globals.css", () => {
    expect(doc.light).toEqual(css.light);
    expect(doc.dark).toEqual(css.dark);
  });
});
