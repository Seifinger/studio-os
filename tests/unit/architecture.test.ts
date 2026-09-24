import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

// Prüft die Modulgrenzen aus ARCHITECTURE.md, Abschnitt 3 und Regeln aus CLAUDE.md.
// Bewusst einfache Textprüfungen: schnell, ohne zusätzliche Abhängigkeit.

const root = fileURLToPath(new URL("../..", import.meta.url));
const src = path.join(root, "src");

type SourceFile = { readonly relative: string; readonly content: string };

function sourceFiles(dir: string): SourceFile[] {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((file) => /\.(ts|tsx|mts)$/.test(file))
    .map((file) => ({
      relative: path.posix.join(path.relative(root, dir).split(path.sep).join("/"), file.split(path.sep).join("/")),
      content: readFileSync(path.join(dir, file), "utf8"),
    }));
}

function importsOf(content: string): string[] {
  const pattern = /(?:import|export)\s[^;]*?from\s*["']([^"']+)["']|import\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;
  return [...content.matchAll(pattern)].map((m) => m[1] ?? m[2] ?? m[3] ?? "");
}

const isTest = (file: SourceFile) => /\.test\.tsx?$/.test(file.relative);
const allSrc = sourceFiles(src);
const production = allSrc.filter((file) => !isTest(file));

describe("Architekturregeln", () => {
  it("findet Quelldateien (Selbsttest der Prüfung)", () => {
    expect(production.map((f) => f.relative)).toContain("src/server/env.ts");
    expect(importsOf('import "server-only";\nimport { z } from "zod";')).toEqual(["server-only", "zod"]);
  });

  it("Regel 1: domain ist rein – kein React, kein Next, kein server/app/ui/compositions, kein process.env", () => {
    const violations = allSrc
      .filter((file) => file.relative.startsWith("src/domain/"))
      .flatMap((file) => [
        ...importsOf(file.content)
          .filter((spec) => /^(react|react-dom|next)(\/|$)|^server-only$|^@\/(app|server|ui|compositions)(\/|$)/.test(spec))
          .map((spec) => `${file.relative} importiert ${spec}`),
        ...(file.content.includes("process.env") ? [`${file.relative} liest process.env`] : []),
      ]);
    expect(violations).toEqual([]);
  });

  it("Regel 7: catalog enthält nur Daten und importiert nur aus domain", () => {
    const violations = allSrc
      .filter((file) => file.relative.startsWith("src/catalog/") && !isTest(file))
      .flatMap((file) =>
        importsOf(file.content)
          .filter((spec) => !/^@\/domain\/|^@studio\/design-system\/|^\.\.?\/|^zod$/.test(spec))
          .map((spec) => `${file.relative} importiert ${spec}`),
      );
    expect(violations).toEqual([]);
  });

  it("Regel 9: packages/design-system ist rein – nur zod, eigene Dateien und domain", () => {
    const files = sourceFiles(path.join(root, "packages", "design-system", "src"));
    expect(files.map((file) => file.relative)).toContain("packages/design-system/src/themes/schema.ts");
    const violations = files
      .filter((file) => !isTest(file))
      .flatMap((file) => [
        ...importsOf(file.content)
          .filter((spec) => !/^@\/domain\/|^\.\.?\/|^zod$/.test(spec))
          .map((spec) => `${file.relative} importiert ${spec}`),
        ...(file.content.includes("process.env") ? [`${file.relative} liest process.env`] : []),
      ]);
    expect(violations).toEqual([]);
  });

  it("Regel 8: compositions importieren weder server noch ui", () => {
    const violations = allSrc
      .filter((file) => file.relative.startsWith("src/compositions/"))
      .flatMap((file) =>
        importsOf(file.content)
          .filter((spec) => /^@\/(server|ui|app)(\/|$)|^server-only$/.test(spec))
          .map((spec) => `${file.relative} importiert ${spec}`),
      );
    expect(violations).toEqual([]);
  });

  it("Regel 10: nur Seiten mit Anfrage-Endpunkt importieren das scharfe Formular (kein Formular-JavaScript auf Beispielseiten)", () => {
    const violations = production
      .filter((file) => file.relative.startsWith("src/compositions/") && !file.relative.endsWith("/shared/live-request-form.tsx"))
      .flatMap((file) =>
        importsOf(file.content)
          .filter((spec) => /live-request-form$/.test(spec))
          .map((spec) => `${file.relative} importiert ${spec}`),
      );
    expect(violations).toEqual([]);
  });

  it('Regel 2: jedes Modul in src/server beginnt mit import "server-only"', () => {
    const violations = production
      .filter((file) => file.relative.startsWith("src/server/"))
      .filter((file) => !/^import "server-only";\n/.test(file.content))
      .map((file) => file.relative);
    expect(violations).toEqual([]);
  });

  it("Regel 2: Client Components importieren nichts aus src/server", () => {
    const violations = production
      .filter((file) => /^\s*["']use client["']/.test(file.content))
      .filter((file) => importsOf(file.content).some((spec) => /^@\/server(\/|$)|\/server\//.test(spec)))
      .map((file) => file.relative);
    expect(violations).toEqual([]);
  });

  it("Regel 3: nur src/server/env.ts liest process.env", () => {
    const violations = production
      .filter((file) => file.content.includes("process.env"))
      .map((file) => file.relative)
      .filter((file) => file !== "src/server/env.ts");
    expect(violations).toEqual([]);
  });

  it("Regel 6: kein Import aus den Referenzprojekten", () => {
    const everywhere = [...allSrc, ...sourceFiles(path.join(root, "tests"))];
    const violations = everywhere.flatMap((file) =>
      importsOf(file.content)
        .filter((spec) => /gastro-webagentur|gastro-v3/.test(spec))
        .map((spec) => `${file.relative} importiert ${spec}`),
    );
    expect(violations).toEqual([]);
  });
});
