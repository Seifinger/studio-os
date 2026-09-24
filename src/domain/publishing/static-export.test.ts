import { describe, expect, it } from "vitest";

import { checkExport, checkExportedPage, OPERATOR_MISSING_MARKER, SHOWCASE_NOTICE } from "./static-export";

const HEAD = '<meta name="robots" content="noindex, nofollow"/>';
const page = (body: string) => `<html><head>${HEAD}</head><body>${body}</body></html>`;
const showcase = (body = "") => page(`<p>${SHOWCASE_NOTICE}</p>${body}`);

const COMPLETE = [
  { path: ".nojekyll", content: "" },
  { path: "index.html", content: page("Übersicht") },
  { path: "beispiele/index.html", content: page("Übersicht") },
  { path: "beispiele/haus/index.html", content: showcase() },
  { path: "beispiele/impressum/index.html", content: page('<a href="mailto:studio@example.com">Mail</a>') },
  { path: "beispiele/datenschutz/index.html", content: page("Datenschutz") },
];

describe("checkExportedPage", () => {
  it("lässt eine korrekte Beispielseite durch", () => {
    expect(checkExportedPage({ path: "beispiele/haus/index.html", content: showcase('<a href="#besuch">Anrufen</a>') })).toEqual([]);
  });

  it("verlangt noindex auf jeder Seite", () => {
    expect(checkExportedPage({ path: "index.html", content: "<html><body>x</body></html>" })).toContain("noindex fehlt – Beispielseiten gehören nicht in Suchmaschinen");
  });

  it("findet Google-Schlüssel und Namen geheimer Variablen", () => {
    const key = `AIza${"x".repeat(35)}`;
    expect(checkExportedPage({ path: "index.html", content: page(key) })).toContain("enthält einen Schlüssel oder den Namen einer geheimen Variable");
    expect(checkExportedPage({ path: "index.html", content: page("GOOGLE_PLACES_API_KEY") })).toHaveLength(1);
  });

  it("verbietet fremde Skripte und Stylesheets", () => {
    const content = page('<script src="https://cdn.example.com/a.js"></script><link rel="stylesheet" href="//fonts.googleapis.com/css"/>');
    expect(checkExportedPage({ path: "index.html", content })).toHaveLength(2);
  });

  it("verbietet Telefon-, WhatsApp-, Mail- und Maps-Links außerhalb der Rechtstexte", () => {
    for (const link of ['href="tel:+4989999981"', 'href="https://wa.me/4989"', 'href="mailto:a@b.de"', "https://www.google.com/maps/search"]) {
      expect(checkExportedPage({ path: "beispiele/haus/index.html", content: showcase(`<a ${link}>x</a>`) }).length).toBeGreaterThan(0);
    }
    expect(checkExportedPage({ path: "beispiele/impressum/index.html", content: page('<a href="mailto:studio@example.com">x</a>') })).toEqual([]);
  });

  it("verlangt auf Beispielseiten den Hinweis „frei erfunden“", () => {
    expect(checkExportedPage({ path: "beispiele/haus/index.html", content: page("ohne Hinweis") })).toContain("Pflichthinweis „frei erfunden“ fehlt");
  });

  it("meldet fehlende Betreiberangaben und Links auf Lead-Demos", () => {
    expect(checkExportedPage({ path: "beispiele/impressum/index.html", content: page(OPERATOR_MISSING_MARKER) })).toHaveLength(1);
    expect(checkExportedPage({ path: "index.html", content: page('<a href="/demo/abc">Demo</a>') })).toHaveLength(1);
  });
});

describe("checkExport", () => {
  it("lässt einen vollständigen Export durch", () => {
    expect(checkExport(COMPLETE)).toEqual([]);
  });

  it("verlangt Pflichtdateien – ohne .nojekyll liefert GitHub Pages den Ordner _next nicht aus", () => {
    expect(checkExport(COMPLETE.filter((file) => file.path !== ".nojekyll"))).toEqual([{ path: ".nojekyll", problem: "fehlt im Export" }]);
  });

  it("lehnt Serverrouten im Export ab", () => {
    expect(checkExport([...COMPLETE, { path: "api/health/index.html", content: page("") }])).toContainEqual({ path: "api/health/index.html", problem: "Serverroute im statischen Export" });
  });
});
