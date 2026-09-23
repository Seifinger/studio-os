import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { SHOWCASES } from "@/catalog/showcases";
import { checkExport, type ExportedFile } from "@/domain/publishing/static-export";

// Prüft out/ nach `npm run export:showcases`. Schlägt fehl, solange etwas nicht veröffentlicht werden darf.

const out = fileURLToPath(new URL("../../out", import.meta.url));

function exportedFiles(): ExportedFile[] {
  return readdirSync(out, { recursive: true, encoding: "utf8" })
    .map((file) => file.split(path.sep).join("/"))
    .filter((file) => !file.startsWith("_next/") && /\.(?:html|txt)$|^\.nojekyll$/.test(file))
    .map((file) => ({ path: file, content: readFileSync(path.join(out, file), "utf8") }));
}

describe("Statischer Export der Beispielseiten", () => {
  it("liegt in out/ vor", () => {
    expect(existsSync(path.join(out, "index.html")), "Zuerst `npm run export:showcases` ausführen").toBe(true);
  });

  it("enthält jede Beispielseite", () => {
    for (const showcase of SHOWCASES) expect(existsSync(path.join(out, "beispiele", showcase.slug, "index.html"))).toBe(true);
  });

  it("darf veröffentlicht werden", () => {
    expect(checkExport(exportedFiles())).toEqual([]);
  });
});
