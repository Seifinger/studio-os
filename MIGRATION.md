# MIGRATION.md – Was aus den Referenzprojekten übernommen wird (und was nicht)

Stand: 23.09.2026 · Grundlage: Lesende Analyse, keine Änderung an den Referenzen.

| Referenz | Pfad | Stand (Commit) |
|---|---|---|
| gastro-webagentur (v1 + v2-Pipeline) | `../gastro-webagentur` | `bd23138` (23.09.2026) |
| gastro-v3 (kompositionsbasierter Generator) | `../gastro-v3` | `ddcad23` (23.09.2026) |

## 0. Grundsatz

1. **Referenz, keine Kopiervorlage.** Übernommen werden *Regeln, Datenmodelle, Erkenntnisse und
   Testfälle* – nicht Dateien. Jeder Kandidat wird in TypeScript neu geschrieben, mit Zod-Schema und
   Vitest-Tests. Die Tests der Referenz dienen dabei als Spezifikation („was muss gelten?“), nicht als
   Code zum Einfügen.
2. **Nie zur Laufzeit importieren.** Kein `import` aus `../gastro-*`, keine Symlinks, keine
   Git-Submodule. Ein Test in `tests/unit/architecture.test.ts` prüft das.
3. **Jede Übernahme wird dokumentiert**: Quelle (Datei + Commit), was übernommen wurde, was bewusst
   anders ist – als Eintrag in `docs/decisions/`.
4. **Instabiles, Doppeltes oder Unklares wird dokumentiert statt migriert** (siehe Abschnitt 2).

## 1. Bestandsaufnahme

### gastro-webagentur

- **v1 (`src/`, ~59 Dateien, Node-ESM, JavaScript):** Lead-Suche über Google Places (`placesClient.js`,
  `scoring.js`, `websiteAnalyzer.js`, CSV-Export), Landing-Page-Generator für 12 Küchen × 3 Stimmungen
  (`landingPageGenerator.js` mit 1.390 Zeilen HTML/CSS/JS in Template-Strings, `designPresets.js`,
  `stimmungen.js`, `heroSignature.js`, `styles/handschrift.css.js` mit 1.004 Zeilen CSS-in-JS),
  Agentur-Dashboard, Wirt-Server mit Tischplan/Kapazität/No-Show (`betriebStore.js`, 693 Zeilen),
  Resonanz-Beacon, Push/Telegram, Rechnungs-PDF, Veröffentlichung nach `docs/` (361 generierte Dateien
  im Repo).
- **v2 (`v2/`, parallel zu v1):** Pipeline Referenz → Designsystem → Build → Judge → Integration.
  101 analysierte Referenzen (40 Refero-Styles, 61 reale Restaurant-Websites), 36 generierte
  Designsystem-Dokumente, Anti-Slop-Lint, Copy-Refiner gegen KI-Floskeln, Design-Judge im Browser.
  Danach eine Art-Direction-Runde: Briefing mit Status je Feld, Creative Direction je Restaurant,
  Bildplan, Screenshot-Review mit Zuständen, Tauschprobe.
- **Tests:** `node:test`, ~520 Tests, seriell (`--test-concurrency=1`), weil Tests echte Dateien unter
  `data/` schreiben.
- **Wichtigste Erkenntnis aus dem eigenen Audit (`v2/ART-DIRECTION-AUDIT.md`):** Die Oberfläche war
  sauber (Schriften, Kontraste, Raster), die Dramaturgie aber ein Template – drei Archetypen erzeugten
  drei Seitenbaupläne, der Hero war eine Seed-Lotterie, Stockfotos zeigten falsche Gerichte, derselbe
  Innenraum stand bei mehreren „Häusern“. Der Judge vergab trotzdem 10/10, weil er nur Oberfläche maß.

### gastro-v3

- Node-22-ESM, Express nur für Server, statische Kundenseiten.
- `src/briefing`: AJV-Schema, Provenienzmodell `{ value, status: confirmed | draft | unknown }`.
- `src/tokens`: 6 Archetypen, Typo-Profile, Kontrastableitung.
- `src/blueprints`: 20 Bausteine (je `index/style/motion/meta`), `src/composer`: deterministische
  Sektionswahl, `src/renderer`: HTML + Inline-CSS + JSON-LD, `src/judge`: hartes Build-Gate.
- `src/wirt`: Wirt-Portal mit scrypt-Passwörtern, HMAC-Sessions, CSRF (Double Submit), Mandantentrennung
  je Datei, SSE, Web Push, Telegram.
- `dashboard/`: Agentur-Dashboard (Bearer-Token, nur 127.0.0.1) + Prospect-Workflow mit Google Places.
- `scripts/migrate-from-v1.js`: liest v1-Piloten lesend.
- CI auf Ubuntu **und** Windows – laut GitHub Actions grün auf `main` (Lauf #7, `ddcad23`); der im
  Produktplan genannte Suchbutton-Fehler ist mit PR #2 behoben (`DECISIONS.md`, „Prospect workflow repair“).
- **Rolle laut Produktplan:** bleibt Vertriebs- und Recherche-Prototyp bis ROADMAP Stufe 8.

## 2. Befunde: doppelt, widersprüchlich, instabil

Diese Punkte werden **nicht** migriert, sondern hier festgehalten, damit studio-os sie von Anfang an
einheitlich löst.

| # | Befund | Wo | Konsequenz für studio-os |
|---|---|---|---|
| B1 | **Drei parallele Seiten-Engines** (v1-Generator, v2-Builder + Komposition, v3-Composer/Renderer), alle HTML per String-Konkatenation | beide Repos | Eine Engine: React Server Components. Keine HTML-Strings. |
| B2 | **Zwei Provenienzmodelle**: v2 `bestaetigt/uebernommen/vorschlag/unbekannt` mit `quelle`; v3 `confirmed/draft/unknown`. v3-`DECISIONS.md` widerspricht sich selbst bei der Abbildung von `uebernommen` (einmal → `confirmed`, später „alles → `draft`“) | `v2/briefing/briefing.js`, `gastro-v3/src/briefing`, `gastro-v3/DECISIONS.md` | Ein Modell mit fünf Zuständen (die vier aus v2 plus `fiktiv`) + Quelle + Datum; umgesetzt in Stufe 1 (ADR 0015). |
| B3 | **Lead-Scoring doppelt** mit abweichender Semantik: v1 setzt bei unerreichbarer Website `score: 0` + „Zu prüfen“, v3 `score: null`. Stichwortlisten unterschiedlich lang (v1: 13/11, v3: 6/7) | `src/scoring.js`, `src/websiteAnalyzer.js` vs. `dashboard/prospect-server.js` | v3-Semantik (`null` statt geratener Zahl) + v1-Stichwortlisten, eine Implementierung. |
| B4 | **Google-Places-Client dreifach** (v1 `placesClient.js`, v3 `prospect-server.js`, v3 `lead-finder-server.js` – letzterer „nicht mehr verdrahtet“) | beide Repos | Genau ein Adapter hinter einem Port. |
| B5 | **Wirt-Datenhaltung doppelt**: v1 `betriebStore.js`, v3 `src/wirt/store.js` („Adaption“ davon), beide JSON-Dateien je Betrieb | beide Repos | Neu mit Datenbank im geplanten Dashboard-Schritt; die Fachregeln (Kapazität, Tische, No-Show) werden als reine Funktionen mit den Referenztests als Spezifikation übernommen. |
| B6 | **Designregeln widersprechen sich**: v2 verbietet Inter, DM Sans, `system-ui`, Glasmorphismus (`backdrop-filter`); v1 nutzt Inter als Textschrift; v3 nutzt DM Sans und „Liquid Glass“ im Video-Hero | `v2/build/schriften.js`, `v2/build/antiSlopLint.js`, `gastro-v3/src/tokens/typography.json`, `gastro-v3/src/blueprints/hero-video` | Einmal in `DESIGN.md` entschieden (Abschnitt 3). |
| B7 | **Schriften von Google-Servern**: v3 bindet `fonts.googleapis.com` ein; v1/v2 hosten bewusst lokal (DSGVO, offline) | `gastro-v3/src/renderer/fonts.js` | Kundenseiten hosten Schriften selbst (DESIGN.md). |
| B8 | **Sicherheitslücken in v1**: `/intern/`-Routen des Wirt-Servers ohne Token (dokumentiert als E7.10), Dashboard-Token nur optional (Warnung statt Abbruch) | `src/wirtServer.js`, `src/dashboardServer.js` | Auth ist Pflicht, kein „läuft auch ohne Token“. v3-Muster (scrypt, HMAC, CSRF, konstante Vergleichszeit) sind die Messlatte. |
| B9 | **Google-Places-Daten dauerhaft gespeichert**: v1 schreibt Name, Adresse, Telefon, Website, Bewertung in CSV unter `data/output/`; v3 speichert dieselben Felder dauerhaft in `data/runtime/prospects.json` | `src/csvExport.js`, `dashboard/prospect-server.js` | Widerspricht Produktprinzip 8 und der Google-Policy (nur Place-IDs dürfen gespeichert werden). Dauerhaft nur `place_id` + eigene Analyse + unabhängig erhobene Angaben; Places-Inhalte live abrufen (ADR 0013). |
| B10 | **Fremdes Video fest im Code**: v3 verdrahtet eine CloudFront-URL als Demo-Video (`PROSPECT_DEMO_VIDEO_URL`), Rechte unklar | `gastro-v3/src/blueprints/_shared/util.js` | Nicht übernehmen. Medien nur mit dokumentierten Rechten. |
| B11 | **Stockfotos als Hausfotos**: Unsplash-Hotlinks; falsche Gerichte, ein Teamfoto auf allen 36 Seiten (eigener v2-Audit) | `src/imageLibrary.js`, `v2/medien/stockKatalog.json` | Stock nie für Haus/Team/Raum; Bildplan mit Eignungsprüfung (DESIGN.md). |
| B12 | **Messwert als Qualitätsbeleg**: Design-Judge 36/36 mit 10,0, obwohl die Seiten austauschbar waren | `v2/judge/designJudge.js`, `v2/ART-DIRECTION-AUDIT.md` | Automatische Prüfungen sichern nur Untergrenzen. Qualitätsurteil bleibt Review + Tauschprobe. |
| B13 | **Generierte Artefakte eingecheckt**: `docs/` (361 Dateien), `v2/output/` (Seiten, Schriften, Screenshots) | gastro-webagentur | Build-Ausgaben gehören nicht ins Repo. |
| B14 | **Test-Isolation**: v1-Tests schreiben in echtes `data/` (deshalb seriell); v3 hatte dadurch eine Race Condition unter Windows | beide Repos | Tests schreiben nie ins Arbeitsverzeichnis; Abhängigkeiten werden injiziert. |
| B15 | **Veraltete Projektregeln**: v1-`CLAUDE.md` beschreibt eine frühere Arbeitsweise („nur Planung“), laut v2-Abschlussbericht überholt | gastro-webagentur | studio-os hält `CLAUDE.md` bei jeder Regeländerung aktuell. |
| B16 | **Beispielkarten mit Preisen je Küche** (`menuCatalog.js`) landen auf Entwürfen echter Lokale, nur mit kleinem „Platzhalter“-Hinweis | `src/menuCatalog.js` | Verstößt gegen Produktprinzip 5. Keine Katalog-Gerichte/-Preise auf Seiten realer Betriebe. |
| B17 | **Unbeauftragte Entwürfe unter echtem Namen öffentlich** (GitHub Pages, mit `noindex` und Hinweisleiste) | `src/publishSite.js` | Rechtlich heikel (Namens-/Markenrecht, UWG). In studio-os nur nach Einwilligung oder mit fiktiven Betrieben. |
| B18 | **Lizenzkosten-Falle**: Remotion (Company License ab 4 Beschäftigten), ~168 kB gzip für eine Animation | `src/motion/RemotionSignature.jsx` | Nicht übernehmen. |

## 3. Kandidaten zur Übernahme

Alle Kandidaten werden **neu geschrieben**. „Quelle“ nennt die Datei, deren Regeln und Tests als
Spezifikation dienen.

| ID | Kandidat | Quelle | Ziel in studio-os | Begründung |
|---|---|---|---|---|
| K1 | **Provenienzmodell** für Betriebsfakten: Status `bestaetigt · uebernommen · vorschlag · unbekannt`, Quelle, Zeitstempel. Regeln: nur `bestaetigt`/`uebernommen` gelten als Tatsache; `vorschlag` nur mit sichtbarer Entwurfsmarke; `unbekannt` nie; ein leerer Wert kann nicht bestätigt sein | `v2/briefing/briefing.js` (`istTatsache`, `istZeigbar`), `gastro-v3/src/briefing/validator.js`, `gastro-v3/src/blueprints/_shared/util.js` (`confirmed()`) | `src/domain/provenance` | Kern von Produktprinzip 5. Beide Referenzen haben es unabhängig erfunden – das ist der stärkste Beleg, dass es gebraucht wird. |
| K2 | **Briefing-Felder und Fragenkatalog** (30 Felder, je eine Frage an den Kunden) | `v2/briefing/briefing.js` (`FELDER`) | `src/domain/briefing` (Zod) | Fachwissen, das man nicht neu erfinden muss; macht Lücken im Gespräch sichtbar. |
| K3 | **Lead-Scoring = Need Score** (Gewichte 25/20/25/20/10, Schwellen 80/50/25, `null` bei unerreichbar). Der **Close Score** des Produktplans (Abschlusswahrscheinlichkeit) ist neu, hat kein Vorbild in den Referenzen und wird in Stufe 8 eigens entworfen – nur aus eigenen Beobachtungen, nie aus Google-Rezensionen | `src/scoring.js`, `gastro-v3/dashboard/prospect-server.js` (`scoreProspect`) | `src/domain/leads/scoring.ts` | Need Score: reine Funktion, klar spezifiziert, zweimal bewährt. |
| K4 | **Website-Heuristik** (Bestell-/Reservierungsanbieter, Viewport, Copyright-Jahr, HTTPS) | `src/websiteAnalyzer.js` (größere Stichwortliste) | `src/server/leads/website-analysis.ts` | Wertvoll für die Priorisierung; muss um SSRF-Schutz, Größenlimit und Zeitlimit erweitert werden. |
| K5 | **Google-Places-Textsuche** (Places API (New), Field Mask ohne Fotos/Rezensionen) | `src/placesClient.js`, `gastro-v3/dashboard/prospect-server.js` | Adapter hinter `PlacesSearchPort`; Field Masks bereits als getestete Konstanten (`places-fields.ts`, ADR 0013) | Field-Mask-Disziplin ist richtig (Kosten, Datenschutz); Speicherung wird neu geregelt (B9). |
| K6 | **Farbmathematik und WCAG-Kontrast** | `src/colorMath.js`, `gastro-v3/src/tokens/index.js` | `src/domain/color` | Grundlage aller Kontrast-Gates. In der Foundation bereits neu geschrieben (`contrast.ts`), weil die Studio-Tokens geprüft werden müssen. |
| K7 | **Copy-Regeln gegen KI-Floskeln** (deutsch) mit Begründungstabelle | `v2/build/copyRefiner.js`, `v2/COPY-PRINZIPIEN.md` | `src/domain/content/copy-rules.ts` + DESIGN.md | Konkret, deutsch, begründet; als Regeldaten mit Tests übernehmen. Automatisches Umschreiben nur als Vorschlag, nie stillschweigend. |
| K8 | **Katalog verbotener Gestaltungsmuster** (mehrfarbige Verläufe, drei gleiche Karten, Emoji-Icons, Text-auf-Foto-Schleier, Pillen-Flut, Schriftuntergrenzen …) | `v2/build/antiSlopLint.js`, `gastro-v3/src/judge/index.js` | DESIGN.md (Regeln) + später Prüfungen gegen gerenderte Seiten | Die Regeln sind gut; die Prüfmechanik (eigener HTML/CSS-Parser in v2, Regex in v3) nicht. |
| K9 | **Creative-Direction-Struktur**: Leitidee, Wirkung, Metapher, Bildregeln, Typo-Rollen, Dramaturgie mit „warum“ je Abschnitt, Signature-Details nur mit Beleg, bewusster Verzicht | `v2/creative/creativeDirection.js`, `v2/creative-direction/*.md` | `src/domain/creative-direction` | Die Antwort des Audits auf das Template-Problem. Struktur übernehmen, nicht die Pilot-Inhalte. |
| K10 | **Bildplan**: je Bildplatz Motiv, Rolle, Zuschnitt desktop/mobil, Fokuspunkt, Alt-Text, Herkunft, Rechte, Freigabe; Vorrang eigen > beauftragt/KI (gekennzeichnet) > gesichteter Stock; Haus/Team/Raum nie Stock | `v2/assets-pipeline/bildplan.js` | `src/domain/media` | Beseitigt die auffälligsten Glaubwürdigkeitsfehler. |
| K11 | **Designsystem-Dokumentformat**: Farbrollen *mit Aufgabe*, Typo-Skala, 8-px-Raster, verbotene Muster je System, Herkunft je Wert | `v2/designsysteme/*.json/.md`, `v2/build/designsystemGenerator.js` | `src/domain/design-system` (Schema) | Format ja; die 36 generierten Inhalte nein (B12, Archetyp-Lotterie). |
| K12 | **Referenzkatalog** (61 reale Restaurant-Websites, 40 Refero-Styles, je Analyse von Palette, Typo-Charakter, Rhythmus) | `v2/referenzen/` | `research/references/` (Daten, keine Code-Abhängigkeit) | Wertvolle Recherche. 14 Refero-Referenzen sind laut v2 ungeprüft und keine Restaurants → vor Nutzung sichten. |
| K13 | **Betriebsregeln Reservierung**: Kapazität, Tischverteilung (Gruppen müssen auf Tische passen), Überschneidung, manuelle Einträge mit dauerhaftem Konflikthinweis, No-Show-Schutz mit serverseitigem Zustimmungstext, Wartezeit-Lernen | `src/betriebStore.js`, `test/tischverteilung.test.js`, `gastro-v3/src/wirt/store.js` | `src/domain/operations` (später) | Hoher fachlicher Wert, echte Wirts-Erfahrung. Erst mit der eigenen Bestellstrecke (ROADMAP Stufe 10); der Conversion-Layer (Stufe 5) braucht sie nicht. |
| K14 | **Auth-Muster**: scrypt-Hashes, HMAC-signierte Sessions mit Ablauf, CSRF Double Submit, Vergleich in konstanter Zeit, Mandantentrennung als Datenzugriffsregel (nicht nur Route) | `gastro-v3/src/wirt/auth.js`, `gastro-v3/dashboard/auth.js` | Prinzipien in ARCHITECTURE.md; Umsetzung voraussichtlich über Supabase Auth + Row Level Security | Muster übernehmen, Eigenbau-Krypto nur wo nötig. |
| K15 | **Datensparsame Resonanz-Messung** (keine IP, kein User-Agent, kein Cookie, gerundete Verweildauer) | `src/resonanzStore.js`, `src/resonanzBeacon.js` | Prinzip in ARCHITECTURE.md; Umsetzung später | Gutes DSGVO-Vorbild. |
| K16 | **Deterministische Auswahl** (gleicher Betrieb → gleiche Ausgabe, stabiler Hash statt `Math.random()`) | `gastro-v3/src/composer/index.js` (`seedHash`) | `src/domain` bei Bedarf | Nur für Gleichstände zwischen *begründeten* Optionen, nie als Gestaltungsquelle (B12). |
| K17 | **Screenshot-Review mit Zuständen** (mobile Navigation, Formularfehler, Bestätigung, Warenkorb) und Prüfungen (Überläufe, Touch-Ziele, Fokus, CLS) | `v2/judge/screenshotReview.js` | Playwright-Suite (später) | Prüft, was Menschen wirklich sehen. |
| K18 | **Rechtliche Leitplanken** als Wissen: Google-Places-Nutzungsbedingungen, § 7 UWG (keine Werbe-Mails), keine Rezensionstexte speichern, Beispielseiten kennzeichnen, `noindex` für Entwürfe | READMEs beider Repos, `GOOGLE-LEADS.md` | ARCHITECTURE.md, CLAUDE.md | Kostet nichts, verhindert teure Fehler. |
| K20 | **Küchen-Vorschlag aus dem Betriebsnamen** (Stichwortregeln, Reihenfolge spezielle vor Sammelküchen) | `src/menuCatalog.js` (`detectCuisine`), `test/menuCatalog.test.js` | `src/domain/gastronomy/cuisines.ts` ✅ | Für personalisierte Lead-Demos nötig; neu mit Wortanfang-Treffern, ohne Standardwert, immer als Vorschlag (ADR 0017). |
| K19 | **Lokal gehostete Schriften** (45 OFL-Familien, subsettiert latin/latin-ext) | `v2/output/assets/fonts/`, `v2/build/schriften.js` | Schriftregister mit Lizenznachweis (später) | Nicht die Binärdateien kopieren, sondern je Schrift aus der Originalquelle mit Lizenz neu beziehen. |

## 4. Bewusst nicht übernommen

| Was | Wo | Warum nicht |
|---|---|---|
| v1-Seitengenerator, `PAGE_SCRIPT`, Sections als HTML-Strings | `src/landingPageGenerator.js`, `src/sections/*` | Monolith, HTML/CSS/JS in Strings, nicht typsicher, nicht komponierbar (B1). |
| Handschrift-CSS, Hero-Signaturen, Motion-Code | `src/styles/*.css.js`, `src/heroSignature.js`, `src/motion.js` | An die v1-Archetypen gebunden. Die **Motion-Regeln** (nichts springt, nichts versteckt Inhalt, abschaltbar) gehen in DESIGN.md über, der Code nicht. |
| Archetyp × Stimmung × Seed als Gestaltungsquelle | `src/designPresets.js`, `src/stimmungen.js`, `src/stimmungsWahl.js` | Erzeugt nachweislich austauschbare Seiten (v2-Audit, Tauschprobe). Stimmungen dürfen später höchstens *Startpunkt* einer Creative Direction sein. |
| 36 generierte Designsysteme und v2-Ausgaben | `v2/designsysteme/*`, `v2/output/*` | Generierte Artefakte aus dem Archetyp-Modell; Format ja (K11), Inhalt nein. |
| Beispiel-Speisekarten mit Preisen | `src/menuCatalog.js` | Erfundene Betriebsfakten (B16). Allenfalls später als klar gekennzeichnete Musterkarte für fiktive Demos – eigene Entscheidung nötig. |
| Stock-Bildbibliothek und Unsplash-Hotlinks | `src/imageLibrary.js`, `v2/medien/stockKatalog.json` | Falsche Motive, Rechte und Verfügbarkeit nicht kontrolliert (B11). |
| Design-Judge mit Punktzahl | `v2/judge/designJudge.js`, `v2/build/zyklus.js` | Misst Oberfläche, suggeriert Qualität (B12). Ersetzt durch Prüfungen für Untergrenzen + Review. |
| Eigener HTML/CSS-Parser | `v2/build/parser.js` | Wartungslast; wenn nötig, etablierte Bibliothek mit ADR. |
| v3-Blueprints, Composer, Renderer als Code | `gastro-v3/src/blueprints`, `src/composer`, `src/renderer` | String-HTML, Google-Fonts-CDN, Seed-Wahl zwischen Heroes. **Übernommen werden die Ideen**: nur bestätigte Daten rendern; statt Füllinhalt ehrlich `insufficient` melden; genau ein Signature-Moment. |
| Video-Hero mit fester Demo-URL, Konzept-Demos für echte Betriebe | `gastro-v3/src/blueprints/hero-video`, `dashboard/prospect-server.js` (`renderDemoPreview`) | Rechte unklar (B10); generische Demo unter echtem Namen ohne Beauftragung (B17). |
| Unverdrahteter Lead-Finder | `gastro-v3/dashboard/lead-finder-server.js` | Toter Code (B4). |
| CSV-Export und dauerhafte Prospect-Speicherung mit Places-Feldern | `src/csvExport.js`, `data/runtime/prospects.json` | Verstößt gegen Produktprinzip 8 (B9). |
| Remotion-Signatur | `src/motion/*` | Lizenz- und Gewichtskosten (B18). |
| Engine-Umschalter v1/v2, Engine-Versionen, Entwurfs-Manifest | `src/engineVersion.js`, `src/entwurfsManifest.js`, `v2/integration/dashboardV2.js` | Buchhaltung eines Parallelbetriebs, den studio-os nicht hat. |
| Veröffentlichung nach GitHub Pages | `src/publishSite.js`, `gastro-v3/scripts/publish.js` | Studio-os veröffentlicht über ein Deployment-Ziel hinter einem Port, nur mit Freigabe. Die v3-Regel „nur mit bestätigter Freigabe veröffentlichen“ bleibt. |
| Prompt-Edits (Seite per Sprachmodell umbauen), Rechnungs-PDF | `src/promptEdits.js`, `src/rechnungGenerator.js` | Nicht im Foundation-Umfang; braucht eigenes Konzept (KI-Vorschläge als `vorschlag`, Buchhaltung). |
| Express-Server, JSON-Datei-Stores | beide Repos | Next.js Route Handlers + Supabase ersetzen sie. |
| Daten aus `data/` | beide Repos | Enthalten keine echten Betriebsdaten (beide Repos bestätigen das); nichts zu migrieren. |

## 5. Risikobewertung

Skala: **niedrig** (reine Funktion, gut spezifiziert) · **mittel** (I/O, externe Regeln oder
fachliche Tiefe) · **hoch** (Geld, personenbezogene Daten, rechtliche Wirkung, Betriebsausfall beim Wirt).

| ID | Fachlich | Technisch | Rechtlich/Datenschutz | Gesamt | Hauptrisiko und Gegenmaßnahme |
|---|---|---|---|---|---|
| K1 Provenienz | niedrig | niedrig | mittel | **mittel** | Falsche Abbildung → erfundene „Fakten“ auf Kundenseiten. Gegenmaßnahme: eine einzige Gate-Funktion, vollständige Tests aller Zustände, Veröffentlichung blockiert bei sichtbaren Entwürfen. |
| K2 Briefing | niedrig | niedrig | niedrig | **niedrig** | Feldliste wächst unkontrolliert → Schema versionieren. |
| K3 Scoring | niedrig | niedrig | niedrig | **niedrig** | Gewichte sind Heuristik → als solche kennzeichnen. |
| K4 Website-Heuristik | niedrig | mittel | mittel | **mittel** | SSRF, hängende Anfragen, Robots-Regeln. Gegenmaßnahme: nur http(s), private Netze blockieren, Zeit- und Größenlimit, identifizierender User-Agent. |
| K5 Places-Adapter | mittel | mittel | **hoch** | **hoch** | Nutzungsbedingungen (nur Place-IDs speichern, Google-Logo bei Anzeige), Kosten (Lead-Suche ist Enterprise-SKU). Gegenmaßnahme: feste Field Masks mit Tests, keine Places-Inhalte im Datenmodell, Budget-Alarm, nur serverseitig, Tests nur gegen Mocks. |
| K6 Farbe/Kontrast | niedrig | niedrig | niedrig | **niedrig** | – |
| K7 Copy-Regeln | mittel | niedrig | niedrig | **niedrig** | Übereifrige Regex zerstört korrekte Sätze → nur melden/vorschlagen, nie stumm umschreiben; Tests mit Positiv- und Negativbeispielen. |
| K8 Verbotene Muster | niedrig | mittel | niedrig | **mittel** | Prüfung auf CSS-Ebene ist fehleranfällig → in React-Welt eher über Komponenten-API verhindern als nachträglich parsen. |
| K9 Creative Direction | mittel | niedrig | niedrig | **mittel** | Struktur ohne gute Leitidee bleibt leer (v2-Befund) → Mensch schreibt die Leitidee, System prüft Belege. |
| K10 Bildplan | niedrig | niedrig | mittel | **mittel** | Bildrechte → Rechte und Freigabe als Pflichtfelder. |
| K11 Designsystem-Format | mittel | mittel | niedrig | **mittel** | Überformalisierung → nur Felder, die eine Komposition wirklich liest. |
| K12 Referenzkatalog | niedrig | niedrig | mittel | **niedrig** | Referenzen analysieren ja, Gestaltung kopieren nein; ungeprüfte Einträge markieren. |
| K13 Betriebsregeln | **hoch** | mittel | **hoch** | **hoch** | Fehler kosten den Wirt Gäste; Gästedaten sind personenbezogen; No-Show-Gebühren rechtlich sensibel. Gegenmaßnahme: Referenztests als Spezifikation, Transaktionen in der DB, Review vor Livegang. |
| K14 Auth | mittel | **hoch** | **hoch** | **hoch** | Mandantentrennung. Gegenmaßnahme: Row Level Security + serverseitige Prüfung, Tests für Fremdzugriff. |
| K15 Resonanz | niedrig | niedrig | mittel | **niedrig** | Einwilligungsfrage bei echten Kunden klären. |
| K16 Determinismus | niedrig | niedrig | niedrig | **niedrig** | Missbrauch als Gestaltungsquelle → Regel in DESIGN.md. |
| K17 Screenshot-Review | niedrig | mittel | niedrig | **niedrig** | Browser-Versionen → Playwright-Version pinnen. |
| K18 Rechtliche Leitplanken | niedrig | niedrig | niedrig | **niedrig** | Veralten → bei Integrationen neu prüfen. |
| K19 Schriften | niedrig | niedrig | mittel | **niedrig** | Lizenz je Schrift nachweisen. |

## 6. Reihenfolge

Die Stufen stehen seit ADR 0012 in [`ROADMAP.md`](ROADMAP.md) (abgeglichen mit dem Produktplan).
Innerhalb jeder Stufe gilt: Referenz lesen → Spezifikation als Tests schreiben → neu implementieren →
Entscheidung in `docs/decisions/` festhalten.

Zuordnung der Kandidaten zu den ROADMAP-Stufen:

| ROADMAP-Stufe | Kandidaten |
|---|---|
| 0 · Foundation ✅ | K6 (Kontrast für die Studio-Tokens) |
| 1 · Fachkern und Content-Modell ✅ | K1, K2, K16, K20 |
| 2 · Inhaltsqualität ✅ | K7, K8, K18 |
| 3 · Design Directions und Art Direction | K9, K10, K11, K12, K19 |
| 4 · Referenzprojekt: erste Kundenseite | K17 |
| 5 · Conversion-Layer | – (neu; nutzt K1/K18) |
| 6 · Livegang | – |
| 7 · Datenbank und Studio-Dashboard | K14 |
| 8 · Lead-Recherche | K3, K4, K5 |
| 9 · Betreiber-Dashboard | K15 |
| 10 · Eigene Bestellstrecke | K13 |

Die Reihenfolge folgt jetzt dem Weg zum ersten Umsatz – erst reine, gut testbare Regeln, dann
Gestaltung und die erste echte Kundenseite, dann die Werkzeuge dahinter. Personenbezogene Betriebsdaten
kommen zuletzt; gastro-v3 deckt die Lead-Recherche bis Stufe 8 ab.
