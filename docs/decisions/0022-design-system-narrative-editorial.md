# 0022 – Design-System-Paket und Basissystem „narrative-editorial“

- **Status:** angenommen
- **Datum:** 2026-09-23
- **Bezug:** ergänzt ADR 0003 (Modulgrenzen), 0019 (Schriftregister), DESIGN.md §7 und §12;
  `packages/design-system/`, `src/compositions/narrative-editorial/`,
  `src/catalog/narrative-demos/`, `docs/design-studies/dishoom-analysis.md`

## Kontext

Der Inhaber setzt eine atmosphärische Restaurant-Website (Dishoom) als Qualitätsmaßstab und möchte
daraus ein eigenes, wiederverwendbares Basissystem – ausdrücklich ohne Nachbau. Es soll der visuelle
Standard für hochwertige Kunden-Demos werden und sich durch Küchen-Themes erweitern lassen. Die
Aufgabe nennt feste Pfade unter `packages/design-system/src/…`; ADR 0003 hatte Pakete bewusst
aufgeschoben.

## Entscheidung

1. **Erstes Paketverzeichnis ohne Workspace-Werkzeug.** `packages/design-system/` ist ein
   Quellordner mit Pfad-Alias `@studio/design-system/*` (tsconfig, Vitest); kein npm-Workspace, kein
   eigener Build. Er entspricht der Zeile `packages/design-system` aus ROADMAP §5 und ist rein:
   nur `zod`, eigene Dateien und `@/domain/*` (Architekturregel 9). React und CSS bleiben in
   `src/compositions/narrative-editorial/`.
2. **Theme als vollständiges, geprüftes Objekt** (`themes/schema.ts`): Farbtoken, Schriftrollen
   (Titel, Text, Label, Bildunterschrift), Abstände, Container, Hero, Navigation, CTA-System,
   Karte, Geschichte, Galerie, Abschluss, mobile Regeln, Barrierefreiheit, Motion-Profil,
   Bildsprache mit Bildplätzen. `themeProblems` prüft Kontraste (Text 4,5:1, Nicht-Text 3:1, auch
   auf „Nacht“), echte Kursive, Schnitte im Register, höchstens drei Familien, Floskeln.
   `extendTheme` leitet Küchen-Themes ab (Objekte verschmelzen, Listen ersetzen, Ergebnis wird
   vollständig geprüft); die Registry nimmt nur fehlerfreie Themes mit registrierter Basis auf.
3. **Komposition als Daten** (`composition/narrative-editorial.ts`): Sequenz aus Abschnitten mit
   Akt (`night`/`paper`), eigener Überschrift und Begründung. Pflicht: Eingang zuerst, Abschluss
   zuletzt, Anfahrt immer, die primäre Handlung hat ein Ziel. Abschnitte ohne Inhalt fallen mit
   Grund weg.
4. **Motion-Profil** (`motion/narrative-editorial.ts`) mit sechs erlaubten Effekten (Kopfzeile beim
   Scrollen, Masken-Einblendung großer Sätze mit Mindestdeckkraft 0,35, minimale Bildbewegung ≤ 4 %
   nur ab 56 rem, Abschnittsköpfe, Hover/Fokus ≤ 250 ms, kontextuelle Handlungsleiste). Keine
   Schleifen (Schema kennt nur `loops: 0`). Umsetzung nur als CSS-Scroll-Timeline unter
   `prefers-reduced-motion: no-preference`; bei `reduce` keine Animation und keine Übergangszeit.
   Die Leiste ist die einzige Stelle mit JavaScript (IntersectionObserver); ohne Skript bleibt sie
   verborgen, weil Kopf, Menü und Eingang dieselben Wege tragen.
5. **Bildbriefings und Prompts** (`media/`): Aus jedem Bildplatz eines Themes entsteht ein Briefing
   mit Zweck, Format, Position, Bildsprache, Licht, Farbwelt, Motiv, Ausschlüssen und Alt-Text-Absicht.
   Prompts sind ausschließlich für Moodboard und Foto-Briefing (`usage: "moodboard-only"`); auf der
   Seite stehen nur eigene, freigegebene Fotos – bis dahin der Bildplatz mit dem Briefing (S10).
6. **Erstes Küchen-Theme `indian-bombay-story`**: Hausküche und Stadt statt Klischees; gemalte
   Ladenschrift (Antonio), Textschrift mit echter Kursive (Source Serif 4, Kursivschnitt neu im
   Register), Sandstein, Messing, Zinnober, Regenabend-Indigo. Bewusst ohne die Merkmale aus
   `dishoom-analysis.md` §11.
7. **Demo-Daten nur in einer Fixture** (`src/catalog/narrative-demos/tiffinstube-rao.fixture.ts`),
   über dieselben Prüfungen wie die Beispielhäuser (`fictionProfile`: Status `fiktiv`, Rufnummer
   089 99998 1xx, Postleitzahl 00xxx). Route `/beispiele/tiffinstube-rao`, Teil des statischen Exports.
8. **DESIGN.md §7** („höchstens ein Bewegungsmoment“) gilt weiter für die Restaurant-Komposition;
   für narrative-editorial gilt das Motion-Profil oben als ausdrücklich beschriebene Ausnahme.

## Betrachtete Alternativen

- **npm-Workspaces/Turborepo jetzt:** echte Paketgrenze, aber Build- und CI-Aufwand ohne heutigen
  Nutzen (ADR 0003). Der Alias lässt sich später ohne Codeänderung auf ein Workspace-Paket umstellen.
- **Theme als erweiterte Design Direction:** Die Directions beschreiben Stil je Küche, nicht
  Dramaturgie, CTA-System und Bewegung; beides zu mischen hätte jede Direction aufgebläht.
- **JavaScript-Scrollbibliothek für Effekte:** mehr Kontrolle, aber Abhängigkeit, Ruckelrisiko und
  Arbeit im Hauptthread; CSS-Scroll-Timelines reichen und fallen ohne Unterstützung sauber weg.
- **KI-Bilder als Platzhalter:** hübscher, aber genau die generische Optik, die das Studio vermeidet,
  und bei Gerichten, Räumen und Menschen eine Täuschung (S10).

## Konsequenzen

- Neue Küchen-Themes sind ein `extendTheme`-Aufruf mit eigener Bildsprache; die Registry prüft sie.
- Kunden-Demos im neuen System brauchen eine NarrativeConfig mit Begründungen je Abschnitt.
- Offen: Umstellung der 14 Beispielhäuser auf narrative-editorial (je Küche ein Theme) und Messung
  der Web-Vitals im Export.
