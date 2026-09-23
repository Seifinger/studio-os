# CLAUDE.md – Verbindliche Entwicklungsregeln für studio-os

Diese Regeln gelten für jede Folgeaufgabe, egal ob Mensch oder KI-Agent. Bei Konflikt zwischen einer
Aufgabe und diesen Regeln: nachfragen, nicht stillschweigend abweichen.

## Projekt in drei Sätzen

studio-os ist die technische Grundlage eines Website-Studios für lokale Betriebe, erster Markt
Restaurants. Nach außen individuelle Websites in Designstudio-Qualität, nach innen getestete,
wiederverwendbare Systeme. Pflichtlektüre vor jeder Aufgabe: `ROADMAP.md`, `ARCHITECTURE.md`,
`DESIGN.md`, `MIGRATION.md`, `docs/decisions/`.

## 1. Referenzprojekte sind tabu

- `../gastro-webagentur` und `../gastro-v3` werden **nur gelesen**. Keine Änderungen, keine Commits,
  keine Branches, keine Skripte starten, die dort schreiben (z. B. `npm run pages`, `npm test` in v1
  schreibt nach `data/`).
- Kein Import, Symlink oder Submodul auf die Referenzen. Kein Kopieren von Dateien oder Codeblöcken.
- Übernahmen laufen nach `MIGRATION.md`: Regeln und Tests als Spezifikation lesen, neu in TypeScript
  schreiben, Quelle (Datei + Commit) in einem ADR nennen.
- Was dort instabil, doppelt oder unklar ist, wird dokumentiert (`MIGRATION.md`, Abschnitt 2), nicht migriert.

## 2. Arbeitsweise

- **Klein und prüfbar**: eine Aufgabe, ein klarer Umfang. Nur bauen, was die Aufgabe verlangt; die
  Stufen in `ROADMAP.md` einhalten. Jede Stufe beginnt erst nach Freigabe.
- **Design vor Code**: Sichtbare Arbeit an Kundenseiten beginnt mit Briefing, Creative Direction und
  Bildplan (`DESIGN.md`, Abschnitt 1) – nie mit einer Vorlage.
- **Entscheidungen festhalten**: Jede nicht-triviale Entscheidung (Architektur, Abhängigkeit,
  Datenmodell, Sicherheitsregel, Designregel) bekommt ein ADR in `docs/decisions/` (Vorlage:
  `docs/decisions/0000-vorlage.md`). Dokumente, die dadurch veralten, im selben Commit aktualisieren.
- **Keine Datenbankmigration** vor dem ausdrücklich geplanten Dashboard-Schritt (ROADMAP Stufe 7).
- **Kein eigenes Buchungs-, Bestell- oder Zahlungssystem** vor ROADMAP Stufe 10; bis dahin
  Anfragen per E-Mail und Links zu vorhandenen Systemen.
- **gastro-v3 bleibt Vertriebsprototyp** bis Stufe 8 und wird aus studio-os heraus nicht verändert.

## 3. Testpflicht

- Jede neue Funktion in `src/domain` und `src/server` hat Vitest-Tests – auch für Fehlerpfade.
- **Kritische Funktionen** brauchen Tests für Erfolg, Fehler und Grenzfälle, bevor sie gemergt werden:
  alles mit Geheimnissen, personenbezogenen Daten, Geld, Reservierungen/Bestellungen, externen APIs,
  Veröffentlichung und dem Fakten-Gate.
- Jeder Bugfix bringt einen Regressionstest mit, der vorher rot war.
- Tests schreiben nie ins Arbeitsverzeichnis und rufen nie echte externe Dienste auf. Ports werden
  durch Fakes ersetzt; Zeit und Zufall werden injiziert.
- Tests werden nie übersprungen, deaktiviert, abgeschwächt oder gelöscht, um grün zu werden.
- **Vor jedem Commit grün**: `npm run check` (Lint, Typprüfung, Unit-Tests) und `npm run build`.
- Playwright (`npm run test:e2e`) prüft Beispielseiten mobil und am Desktop; mit vorinstalliertem
  Chromium `PLAYWRIGHT_CHROMIUM_EXECUTABLE` setzen.

## 4. Abhängigkeiten

- **Keine neue Abhängigkeit ohne ADR**: Zweck, geprüfte Alternativen (inkl. „selbst schreiben“ und
  „Plattform kann es schon“), Lizenz, Größe/Transitive, Pflegezustand.
- Exakte Versionen (`.npmrc`: `save-exact=true`), Lockfile committen, `npm ci` in CI.
- Laufzeit- und Entwicklungsabhängigkeiten sauber trennen.
- Keine bezahlten Dienste als Voraussetzung. Externe Dienste nur über Ports (`src/server/integrations`),
  jede Integration muss abschaltbar sein.
- Aktuelle Liste mit Begründung: `docs/decisions/0009-abhaengigkeiten.md`.

## 5. Geheimnisse und Daten

- **Keine Secrets im Repository** – nicht in Code, Tests, Fixtures, Doku, Commit-Messages oder Logs.
  Lokale Werte nur in `.env.local` (git-ignoriert). `.env.example` enthält nur Namen.
- API-, KI- und Google-Schlüssel nur serverseitig. Nie `NEXT_PUBLIC_` für Geheimnisse.
- `process.env` wird nur in `src/server/env.ts` gelesen. Neue Variable = Zod-Schema + `.env.example` +
  Tabelle in `ARCHITECTURE.md`, Abschnitt 6.
- Jedes Modul in `src/server` (außer Tests) beginnt mit `import "server-only";`.
- **Keine erfundenen Betriebsfakten** in Demos oder Kundenseiten (Öffnungszeiten, Preise, Gerichte,
  Geschichte, Stimmen, Bewertungen). Fiktive Beispielbetriebe sind sichtbar als „Beispiel – frei
  erfunden“ gekennzeichnet und `noindex`; ihre Angaben tragen den Status `fiktiv`.
- Betriebsangaben erscheinen auf Seiten nur über das Fakten-Gate (`src/domain/provenance/gate.ts`);
  kein Rendering an ihm vorbei.
- Google-Places-Daten: dauerhaft nur Place-ID + eigene Analyse + unabhängig erhobene Angaben mit
  Quelle; alle anderen Places-Inhalte nie speichern, sondern live abrufen und mit Google-Logo zeigen.
  Nur die Field Masks aus `places-fields.ts`; keine Rezensionen, keine Google-Fotos (ADR 0013).
- Konzept-Demos für echte Betriebe: nicht öffentlich, gekennzeichnet, Platzhalter statt erfundener
  Inhalte (ADR 0014). Lead-Demos entstehen live aus Place Details und laufen nur lokal
  (`STUDIO_LEAD_DEMOS=local` + localhost, ADR 0021) – nie im statischen Export.
- Beispielbetriebe nur über `defineShowcase`: Rufnummern 089 99998 1xx, Postleitzahlen 00xxx,
  keine Gästestimmen, keine Fotos ohne eigene Rechte (ADR 0020).
- Keine echten Gäste- oder Kundendaten in Tests, Fixtures oder Screenshots.

## 6. Code-Konventionen

- TypeScript strict (siehe `tsconfig.json`), kein `any` – `unknown` + Zod an jeder Grenze.
- Modulgrenzen aus `ARCHITECTURE.md`, Abschnitt 3 einhalten; `tests/unit/architecture.test.ts` prüft sie.
- `domain` ist rein: kein I/O, kein React, kein Next, kein `process.env`.
- Bezeichner im Code englisch, UI-Texte und Dokumentation deutsch (ADR 0008). Fachbegriffe ohne
  treffende Übersetzung bleiben deutsch, dann konsequent.
- Dateinamen in `kebab-case`, benannte Exporte (Ausnahme: Next.js-Konventionsdateien).
- Kommentare erklären *warum*, nicht *was*.
- Styling über Tailwind-Utilities und Tokens aus `DESIGN.md`; keine Farbwerte außerhalb der Tokens.

## 7. Befehle

```bash
npm ci                # Abhängigkeiten exakt nach Lockfile
npm run dev           # Entwicklungsserver
npm run check         # ESLint + Typprüfung + Vitest
npm run build         # Produktions-Build
npm run start         # Produktionsserver (nach build)
npm run test:e2e      # Playwright: Smoke-Test und Beispielseiten (nach build)
npm run export:showcases  # statischer Export der Beispielseiten nach out/
npm run check:export      # Veröffentlichungsprüfung gegen out/ (braucht STUDIO_OPERATOR_*)
```

## 8. Definition of Done

- [ ] Umfang der Aufgabe erfüllt, nichts darüber hinaus gebaut.
- [ ] Tests geschrieben, `npm run check` und `npm run build` grün.
- [ ] Keine neuen Abhängigkeiten ohne ADR, keine Secrets, keine Änderung an den Referenzprojekten.
- [ ] Betroffene Dokumente (`ARCHITECTURE.md`, `DESIGN.md`, `MIGRATION.md`, ADRs, README) aktuell.
- [ ] Sichtbares mobil (390 px) und mit Tastatur geprüft.
- [ ] Abschlussbericht: geänderte Dateien, gelaufene Befehle mit Ergebnis, offene Punkte.

## 9. Git

- Kleine Commits mit aussagekräftiger Nachricht (was und warum).
- Arbeit auf Feature-Branches; kein Force-Push auf gemeinsam genutzte Branches.
- Build-Ausgaben (`.next/`, `test-results/`, `playwright-report/`) werden nie committet.
