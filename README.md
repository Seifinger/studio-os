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
npm run test:e2e      # Playwright: Smoke-Test und Beispielseiten (nach build)
npm run export:showcases  # statischer Export der Beispielseiten nach out/
npm run check:export      # Veröffentlichungsprüfung gegen out/
```

Für `npm run test:e2e` einmalig `npx playwright install chromium` ausführen – oder ein vorhandenes
Chromium nutzen: `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/pfad/zu/chromium npm run test:e2e`.

## Endpunkte

| Pfad | Zweck |
|---|---|
| `/` | Interne Startseite mit technischem Stand (`noindex`) |
| `/api/health` | Health-Check: `200` + `{"status":"ok",…}` oder `503` + `{"status":"degraded",…}`, nie gecacht |
| `/beispiele` | Übersicht der 14 erfundenen Beispielhäuser; `/beispiele/<slug>` je Haus |
| `/beispiele/impressum`, `/beispiele/datenschutz` | Rechtstexte der Beispielseiten (Betreiber aus `STUDIO_OPERATOR_*`) |
| `/demo` | Lead-Demo aus einer Google Place-ID – nur mit `STUDIO_LEAD_DEMOS=local` und über localhost |

## Beispielseiten veröffentlichen (GitHub Pages)

Die Beispielseiten werden statisch exportiert und in ein **eigenes öffentliches Repository**
übertragen; `studio-os` bleibt privat (ADR 0016, 0020). Einmalig:

1. Öffentliches Repository anlegen, z. B. `Seifinger/studio-demos`, und dort *Settings → Pages →
   Deploy from a branch → main / (root)* wählen.
2. Deploy-Key erzeugen (`ssh-keygen -t ed25519 -f demos_key -N ""`), den öffentlichen Teil im
   Demo-Repository unter *Settings → Deploy keys* mit Schreibrecht eintragen.
3. In `studio-os` unter *Settings → Secrets and variables → Actions*:
   - Secrets: `DEMOS_DEPLOY_KEY` (privater Teil), `STUDIO_OPERATOR_NAME`, `STUDIO_OPERATOR_ADDRESS`,
     `STUDIO_OPERATOR_EMAIL`
   - Variablen: `DEMOS_REPOSITORY` (`Seifinger/studio-demos`), `SHOWCASE_BASE_PATH` (`/studio-demos`)
4. Workflow **publish-showcases** unter *Actions* von Hand starten. Er baut, prüft (`check:export`)
   und veröffentlicht nur, wenn alles grün ist.

Lokal lässt sich dasselbe prüfen:

```bash
STUDIO_OPERATOR_NAME="…" STUDIO_OPERATOR_ADDRESS="…" STUDIO_OPERATOR_EMAIL="…" \
SHOWCASE_BASE_PATH=/studio-demos npm run export:showcases && npm run check:export
```

## Lead-Demos (nur lokal)

In `.env.local` `GOOGLE_PLACES_API_KEY` und `STUDIO_LEAD_DEMOS=local` setzen, `npm run dev` starten
und `http://localhost:3000/demo` öffnen. Die Demo entsteht bei jedem Aufruf aus den aktuellen
Google-Angaben; gespeichert wird nichts (ADR 0021). Jeder Aufruf ist eine kostenpflichtige
Enterprise-Anfrage – in der Google Cloud einen Budget-Alarm setzen.
