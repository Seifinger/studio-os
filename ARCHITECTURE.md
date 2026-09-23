# ARCHITECTURE.md – Zielarchitektur von studio-os

Stand: 23.09.2026 · Status: Foundation. Was hier als „später“ markiert ist, existiert noch nicht.

## 1. Zielbild

studio-os ist das Werkzeug eines kleinen Website-Studios für lokale Betriebe. Nach außen entstehen
individuelle Websites in Designstudio-Qualität, nach innen laufen wiederverwendbare, getestete Systeme.
Erster Markt: Restaurants. Später: Hotels, Handwerk, Beauty, Fitness, lokale Dienstleister.

Das System hat drei Gesichter, aber **eine Codebasis und eine Fachschicht**:

| Gesicht | Wer nutzt es | Was es tut | Status |
|---|---|---|---|
| **Studio** | Das Studio-Team | Leads recherchieren, Briefings führen, Creative Direction und Bildplan erarbeiten, Kompositionen prüfen und freigeben | später (ab Stufe 3/6) |
| **Kundenseiten** | Gäste des Betriebs | Die individuell komponierte Website des Betriebs | später (Pilot ab Stufe 4) |
| **Betrieb** | Der Betrieb (z. B. der Wirt) | Reservierungen, Bestellungen, eigene Angaben pflegen | später (Stufe 7) |

Branchenneutralität ist ein Architekturziel, kein Feature der ersten Stufen: Fachbegriffe, die nur für
Restaurants gelten (Speisekarte, Tische, No-Show), liegen in einem eigenen Branchenmodul, nicht im
Kern (Provenienz, Briefing-Grundfelder, Designsystem, Medien).

## 2. Technische Basis

Next.js (App Router) · TypeScript strict · Tailwind CSS · Zod · Vitest · Playwright (vorbereitet) ·
Node.js 22 · npm. Begründung und Versionen: [`docs/decisions/0002-tech-stack.md`](docs/decisions/0002-tech-stack.md).

- Server Components sind der Standard. Client-JavaScript nur für echte Interaktion (Formulare,
  Warenkorb), damit Kundenseiten schnell bleiben.
- Die App muss mit `next build && next start` auf jedem Node-Host laufen. Anbieterspezifische APIs
  (Vercel, Supabase …) liegen ausschließlich hinter Ports (Abschnitt 6).

## 3. Modulgrenzen

```
src/
├─ app/                  Routing und Seitenhülle (Next.js). Dünn: liest Daten über server/, rendert ui/ oder compositions/.
│  └─ api/               Route Handlers (öffentliche und interne HTTP-Schnittstellen)
├─ domain/               Fachkern. Reines TypeScript + Zod. Kein I/O, kein React, kein Next, kein process.env.
├─ server/               Nur serverseitig (jede Datei beginnt mit `import "server-only"`).
│  ├─ env.ts             Einzige Stelle, die process.env liest (Zod-validiert).
│  ├─ health.ts          Health-Report.
│  └─ integrations/      Ports (Schnittstellen) und später Adapter zu Google Places, Supabase, Resend, Vercel, KI.
├─ ui/                   (später) Funktionale UI des Studios: Button, Feld, Tabelle … – ein stabiles Token-Set.
└─ compositions/         (später) Kreative Website-Kompositionen je Betrieb: Sektionen, Signaturen, Themes.
tests/
├─ unit/                 Übergreifende Tests (z. B. Architekturregeln).
└─ e2e/                  Playwright (vorbereitet: ein Smoke-Test).
```

### Abhängigkeitsregeln

```
app ──► server ──► domain
 │        └──► integrations (Ports) ◄── Adapter (später)
 ├──► ui ──────► domain (nur Typen)
 └──► compositions ──► domain (nur Typen und reine Funktionen)
```

1. `domain` importiert nichts aus `app`, `server`, `ui`, `compositions`, React oder Next.
2. `server` darf nie in Client Components landen (`import "server-only"` bricht den Build ab).
3. Nur `src/server/env.ts` liest `process.env`. Alle anderen Module bekommen Konfiguration übergeben.
4. `ui` und `compositions` importieren sich **nicht gegenseitig**. Das Studio-Aussehen darf nicht in
   Kundenseiten durchsickern und umgekehrt (DESIGN.md, Abschnitt 2). Gemeinsame *Logik* (z. B.
   Validierung eines Reservierungsformulars) liegt in `domain`, das *Aussehen* bleibt getrennt.
5. Adapter werden nur an einer Stelle zusammengesteckt (Composition Root in `server/`, später) und
   sonst nirgends direkt importiert – Tests ersetzen sie durch Fakes.
6. Kein Import aus den Referenzprojekten `../gastro-webagentur` oder `../gastro-v3`.

Regeln 1, 2, 3 und 6 prüft `tests/unit/architecture.test.ts` bei jedem `npm test`. Regel 4 und 5
werden geprüft, sobald die Ordner existieren (ESLint-Regel `no-restricted-imports`, eigener ADR).

## 4. Datenfluss

### 4.1 Vom Lead zur Kundenseite (Zielbild)

```
 Google Places (Adapter, serverseitig)
        │  PlaceCandidate (flüchtig)
        ▼
 Lead-Recherche ──► Scoring (domain, rein) ──► Lead: place_id + eigene Analyse + Status
        │                                          (Places-Felder nur mit Ablaufdatum)
        ▼
 Gespräch / Intake ──► Briefing (jedes Feld mit Status + Quelle + Zeitstempel)
        │
        ▼
 Creative Direction (Mensch schreibt, KI schlägt vor) ──► Designsystem-Tokens + Bildplan
        │
        ▼
 Komposition (React, nur Fakten über das Fakten-Gate)
        │
        ▼
 Prüfung: automatische Untergrenzen (Kontrast, Touch-Ziele, Performance, Copy-Regeln,
          keine sichtbaren Entwürfe) + menschliches Review + Tauschprobe
        │
        ▼
 Freigabe durch den Kunden ──► Veröffentlichung (Deployment-Port)
```

### 4.2 Das Fakten-Gate

Jede Angabe über einen Betrieb (Öffnungszeiten, Preise, Gerichte, Geschichte, Auszeichnungen,
Bewertungen, Fotos) trägt einen Status:

| Status | Bedeutung | Darf auf die veröffentlichte Seite? |
|---|---|---|
| `bestaetigt` | vom Betrieb bestätigt | ja |
| `uebernommen` | aus einer benannten Quelle übernommen (z. B. Google Places, mit Datum) | ja, sofern die Quelle die Anzeige erlaubt |
| `vorschlag` | Vorschlag des Studios oder einer KI | nur in der Vorschau, sichtbar als Entwurf markiert; blockiert die Veröffentlichung |
| `unbekannt` | liegt nicht vor | nie |

Kompositionen lesen Betriebsangaben ausschließlich über dieses Gate (Umsetzung: Stufe 1, siehe
MIGRATION.md K1). Fehlen Pflichtangaben, meldet der Build „unvollständig“ mit Begründung, statt
Füllinhalt zu erzeugen.

### 4.3 Betrieb (später)

```
 Kundenseite (Formular) ──► Route Handler: Zod-Validierung, Rate-Limit, Mandant aus der Route
        ──► Fachregeln (domain: Kapazität, Tische, No-Show) ──► Datenbank (Transaktion)
        ──► Benachrichtigung (E-Mail/Push/Telegram über Ports) ──► Betriebs-Oberfläche
```

## 5. Security- und Datenschutzprinzipien

**Geheimnisse**
- API-Schlüssel (Google, KI, Supabase-Service-Role, Resend, Vercel) existieren nur in Server-Umgebungen:
  lokal in `.env.local` (git-ignoriert), in Deployments als Umgebungsvariablen.
- Kein Geheimnis mit Präfix `NEXT_PUBLIC_` – `parseServerEnv` lehnt das zur Laufzeit ab, ein Test prüft es.
- `.env.example` enthält nur Namen, nie Werte. Geheimnisse erscheinen nie in Logs, Fehlermeldungen,
  Health-Antworten oder Test-Fixtures.

**Eingaben und Ausgaben**
- Jede Grenze validiert mit Zod: Route Handler, Formulare, Webhooks, **auch Antworten externer APIs**.
- Fehlermeldungen an Clients sind allgemein; Details nur im Server-Log (ohne personenbezogene Daten).
- Ausgehende Abrufe fremder Websites (Website-Heuristik, später): nur `http`/`https`, keine privaten
  oder lokalen Netze (SSRF), Zeitlimit, Größenlimit, identifizierender User-Agent, kein Umgehen von
  Logins oder robots-Regeln.

**Zugriff (später, Stufe 6)**
- Authentifizierung für Studio und Betriebe; Mandantentrennung in der Datenbank (Row Level Security)
  **und** serverseitig geprüft. Ein Test versucht immer den Zugriff auf fremde Daten.
- Schreibende Aktionen mit CSRF-Schutz (bei Server Actions durch Next.js, bei eigenen Routen explizit).
- Öffentliche Endpunkte (Reservierung) mit Rate-Limit und ohne Preisgabe von Kapazitätsdetails.

**HTTP**
- Sicherheits-Header in `next.config.ts` (`X-Content-Type-Options`, `Referrer-Policy`,
  `X-Frame-Options`, `Permissions-Policy`), `X-Powered-By` aus. Eine Content-Security-Policy mit Nonces
  folgt mit den ersten Kundenseiten (eigener ADR).

**Datenschutz**
- **Google Places:** Dauerhaft gespeichert wird nur die Place-ID und die eigene Analyse. Andere
  Places-Inhalte (Name, Adresse, Telefon, Bewertung) nur zwischengespeichert mit Ablaufdatum (Standard
  ≤ 30 Tage) und nur im Rahmen der jeweils gültigen Google-Maps-Platform-Bedingungen – vor Stufe 5 neu
  prüfen. Keine Rezensionstexte, keine Fotos von Google auf Kundenseiten.
- Keine Tracker, keine Drittanbieter-Schriften, keine Hotlinks auf Bilddienste in Kundenseiten.
- Gästedaten (später): Zweckbindung, Löschfristen, Anbieter mit EU-Region und Auftragsverarbeitungsvertrag.
- Kein unaufgeforderter Werbe-Versand (§ 7 UWG); Entwürfe für echte Betriebe nur nach Einwilligung
  öffentlich.

**KI**
- Aufrufe nur serverseitig. KI-Ergebnisse sind immer Status `vorschlag` und werden nie automatisch zur
  Tatsache. Keine personenbezogenen Gästedaten an KI-Dienste.

**Lieferkette**
- Exakte Versionen in `package.json`, Lockfile im Repo, `npm ci` in CI. Neue Abhängigkeiten nur mit
  ADR (CLAUDE.md).

## 6. Externe Integrationen (später)

Alle Integrationen laufen über **Ports** (TypeScript-Schnittstellen in `src/server/integrations/`).
Ohne Konfiguration ist eine Integration einfach aus; nichts in der Foundation setzt ein Geheimnis
voraus. Die Umgebungsvariablen sind in `src/server/env.ts` bereits als *optional* beschrieben.

| Integration | Zweck | Port | Umgebungsvariablen | Ab Stufe | Kosten / Hinweise |
|---|---|---|---|---|---|
| Google Places API (New) | Lead-Recherche | `PlacesSearchPort` (Typ vorhanden) | `GOOGLE_PLACES_API_KEY` | 5 | Nutzungsabhängig; Budgetwarnung in Google Cloud setzen. Nutzungsbedingungen zur Speicherdauer beachten. |
| Supabase | Postgres, Auth, Storage | Repositories je Fachbereich (entstehen mit Stufe 6) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (nur Server) | 6 | Free-Tier vorhanden (inaktive Projekte werden pausiert – Limits vor Einsatz prüfen); EU-Region wählen. Keine Migration vor Stufe 6. |
| Resend | Transaktionale E-Mails (Bestätigungen, Benachrichtigungen) | `EmailSenderPort` (Typ vorhanden) | `RESEND_API_KEY`, `EMAIL_FROM` | 7 | Free-Tier vorhanden; Absenderdomain verifizieren. |
| Vercel | Hosting; später automatisierte Deployments/Domains je Kunde | `DeploymentPort` (entsteht mit Stufe 8) | `VERCEL_TOKEN` (erst Stufe 8) | 0 (Hosting), 8 (API) | Hobby-Tarif laut Vercel nur für nicht-kommerzielle Nutzung → für Kundenprojekte Tarif prüfen. Die App bleibt auf jedem Node-Host lauffähig. |
| KI-Anbieter (z. B. Anthropic) | Vorschläge für Texte, Creative Direction, Bildplan | `TextAssistantPort` (entsteht bei Bedarf) | `ANTHROPIC_API_KEY` | 3+ | Optional; ohne Schlüssel laufen alle Regeln weiter. |
| Web Push / Telegram | Benachrichtigung des Betriebs | `NotificationPort` (später) | (später) | 7 | Kostenlos; Referenz: v1/v3-Umsetzung. |

## 7. Betrieb und Qualitätssicherung

- **Checks:** `npm run check` (ESLint, Typprüfung, Vitest) und `npm run build` laufen lokal und in CI
  (`.github/workflows/ci.yml`) bei jedem Push und Pull Request.
- **Health-Check:** `GET /api/health` – `200` mit `status: "ok"` oder `503` mit `status: "degraded"`,
  nie gecacht, ohne Konfigurationswerte. Details: [`docs/decisions/0006-health-check.md`](docs/decisions/0006-health-check.md).
- **Tests:** Vitest für `domain` und `server` (Ports durch Fakes ersetzt), Vertragstests für Adapter
  gegen aufgezeichnete Antworten (später), Playwright für kritische Abläufe und Screenshot-Review (später).
- **Umgebungen:** lokal (`.env.local`), Preview, Produktion. Konfiguration nur über Umgebungsvariablen.
