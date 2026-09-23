# 0003 – Modulgrenzen und ihre Prüfung

- **Status:** angenommen
- **Datum:** 2026-09-23
- **Bezug:** ARCHITECTURE.md, Abschnitt 3; `tests/unit/architecture.test.ts`

## Kontext

Beide Referenzen vermischen Fachlogik, HTML, Konfiguration und I/O in denselben Dateien
(z. B. `landingPageGenerator.js` mit 1.390 Zeilen, `prospect-server.js` mit Routen, API-Aufruf,
Scoring und HTML). studio-os soll von Anfang an Grenzen haben, die nicht nur auf Papier stehen.

## Entscheidung

Eine Next.js-App mit Ordnergrenzen statt mehrerer Pakete: `app` (Routing, dünn), `domain` (rein),
`server` (nur serverseitig, einzige `process.env`-Stelle in `env.ts`), später `ui` (Studio) und
`compositions` (Kundenseiten), die sich nicht gegenseitig importieren.

Geprüft wird automatisch:
- `server-only` am Anfang jedes Servermoduls → Build bricht ab, wenn Client-Code es importiert.
- `tests/unit/architecture.test.ts`: `domain` ist rein, nur `env.ts` liest `process.env`, Client
  Components importieren nichts aus `server`, kein Import aus den Referenzprojekten.

## Betrachtete Alternativen

- **Monorepo mit Paketen (Turborepo/Workspaces):** harte Grenzen, aber Build- und
  Werkzeugaufwand ohne heutigen Nutzen. Wieder prüfen, wenn Kundenseiten getrennt deployt werden.
- **ESLint-Plugin für Grenzen (z. B. `eslint-plugin-boundaries`):** zusätzliche Abhängigkeit für
  fünf Regeln, die ein 100-Zeilen-Test prüft. Sobald `ui` und `compositions` existieren, reicht
  `no-restricted-imports` aus ESLint selbst.

## Konsequenzen

- Die Textprüfungen sind bewusst einfach (Regex); sie können umgangen werden, fangen aber die
  typischen Fehler. Die Gegenprobe (absichtliche Verstöße) schlägt an.
- Neue Ordner brauchen einen Eintrag in ARCHITECTURE.md und ggf. eine Regel im Architekturtest.
