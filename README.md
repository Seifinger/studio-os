# studio-os

Technische Grundlage eines KI-unterstützten Website-Studios für lokale Betriebe. Erster Markt:
Restaurants; später Hotels, Handwerk, Beauty, Fitness und lokale Dienstleister.

**Stand: Stufe 1 von 10.** Foundation (Startseite, Health-Check, Grundlagen) und der Fachkern ohne
Oberfläche: Angaben mit Herkunft, Fakten-Gate für Beispiel-, Lead-Demo- und Kundenseiten,
Betriebs-/Restaurantprofil, Speisekarte, Öffnungszeiten, Aktionen. Fachfunktionen folgen schrittweise nach [`ROADMAP.md`](ROADMAP.md); bis zur
Lead-Recherche in Stufe 8 bleibt `gastro-v3` das Vertriebswerkzeug.

> Ein gemeinsames System im Hintergrund, aber für den Kunden immer eine eigenständige Website.

## Dokumente

| Datei | Inhalt |
|---|---|
| [`ROADMAP.md`](ROADMAP.md) | Produktplan in Stufen: Stack, Reihenfolge, Phasen für Reservierung/Bestellung, Kostenrahmen |
| [`CLAUDE.md`](CLAUDE.md) | Verbindliche Entwicklungsregeln (Tests, Abhängigkeiten, Secrets, Referenzprojekte) |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Zielarchitektur, Modulgrenzen, Datenfluss, Security, Integrationen |
| [`DESIGN.md`](DESIGN.md) | Anti-AI-Slop-Regeln, funktionale UI vs. kreative Komposition, Typografie, Bild, Layout, Motion, Mobile |
| [`MIGRATION.md`](MIGRATION.md) | Was aus `gastro-webagentur` und `gastro-v3` übernommen wird, was nicht, und in welcher Reihenfolge |
| [`docs/decisions/`](docs/decisions/) | Architekturentscheidungen (ADRs) |

## Voraussetzungen

- Node.js 22 (siehe `.nvmrc`, mindestens 22.12)
- npm

Keine Umgebungsvariable ist Pflicht. Wer später Integrationen einschaltet, kopiert `.env.example`
nach `.env.local` (git-ignoriert).

## Befehle

```bash
npm ci                # Abhängigkeiten exakt nach Lockfile installieren
npm run dev           # Entwicklungsserver auf http://localhost:3000
npm run check         # ESLint + Typprüfung + Vitest
npm run build         # Produktions-Build
npm run start         # Produktionsserver (nach build)
npm run test:e2e      # Playwright-Smoke-Test (nach build)
```

Für `npm run test:e2e` einmalig `npx playwright install chromium` ausführen – oder ein vorhandenes
Chromium nutzen: `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/pfad/zu/chromium npm run test:e2e`.

## Endpunkte

| Pfad | Zweck |
|---|---|
| `/` | Interne Startseite mit technischem Stand (`noindex`) |
| `/api/health` | Health-Check: `200` + `{"status":"ok",…}` oder `503` + `{"status":"degraded",…}`, nie gecacht |
