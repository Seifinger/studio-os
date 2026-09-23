# ARCHITECTURE.md – Zielarchitektur von studio-os

Stand: 23.09.2026 · Status: Foundation. Was hier als „später“ markiert ist, existiert noch nicht.
Reihenfolge der Stufen: [`ROADMAP.md`](ROADMAP.md).

## 1. Zielbild

studio-os ist das Werkzeug eines kleinen Website-Studios für lokale Betriebe. Nach außen entstehen
individuelle Websites in Designstudio-Qualität, nach innen laufen wiederverwendbare, getestete Systeme.
Erster Markt: Restaurants. Später: Hotels, Handwerk, Beauty, Fitness, lokale Dienstleister.

Leitsatz: **Ein gemeinsames System im Hintergrund, aber für den Kunden immer eine eigenständige Website.**

Das System hat drei Gesichter, aber **eine Codebasis und eine Fachschicht**:

| Gesicht | Wer nutzt es | Was es tut | Status |
|---|---|---|---|
| **Studio** | Das Studio-Team | Briefings führen, Design/Creative Direction und Bildplan erarbeiten, Kompositionen prüfen und freigeben, Website-Projekte verwalten, Leads recherchieren | später (Stufe 7, Leads Stufe 8; bis dahin gastro-v3) |
| **Kundenseiten** | Gäste des Betriebs | Die individuell komponierte Website des Betriebs – als Demo (nicht öffentlich, ADR 0014) oder live | später (Referenzprojekt Stufe 4, live Stufe 6) |
| **Betrieb** | Der Betrieb (z. B. der Wirt) | Anfragen empfangen (Stufe 5), später Speisekarte, Zeiten und Bilder selbst pflegen (Stufe 9), eigene Bestellungen (Stufe 10) | später |

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

### Verhältnis zur Monorepo-Zielstruktur

Der Produktplan beschreibt ein Monorepo (`apps/websites`, `apps/dashboard`, `apps/customer-portal`,
`packages/ui`, `design-system`, `site-generator`, `scoring-engine`, `integrations`, `content-model`).
Jede dieser Einheiten hat heute einen festen Ordner mit geprüften Grenzen; die Zuordnung steht in
[`ROADMAP.md`](ROADMAP.md) §5. Aufgeteilt wird, wenn Studio und Kundenseiten getrennt deployt werden
sollen – geprüft spätestens in Stufe 7 (ADR 0012).

## 4. Datenfluss

### 4.1 Vom Lead zur Kundenseite (Zielbild)

```
 Google-Places-Suche (serverseitig, Field Mask je Zweck – ADR 0013)
        ▼
 Temporäre Rechercheansicht (live, mit Google-Logo, nichts gespeichert)
        ▼
 Manueller Import eines priorisierten Leads ──► gespeichert: place_id + eigene Angaben mit Quelle
        ▼
 Website-Audit (SSRF-geschützt) ──► Need Score + Close Score (domain, rein)
        ▼
 Design-Direction-Vorschlag ──► Konzept-Demo (Status demo, nicht öffentlich – ADR 0014)
        ▼
 Persönliche Akquise
        ▼
 Kundenbriefing (jedes Feld mit Status + Quelle + Zeitstempel)
        ▼
 Creative Direction (Mensch schreibt, KI schlägt vor) ──► Designsystem-Tokens + Bildplan
        ▼
 Komposition (React, nur Fakten über das Fakten-Gate)
        ▼
 Prüfung: automatische Untergrenzen (Kontrast, Touch-Ziele, Performance, Copy-Regeln,
          keine sichtbaren Entwürfe) + menschliches Review + Tauschprobe
        ▼
 Freigabe durch den Kunden ──► Deployment + Kundendomain
```

Bis Stufe 8 laufen die ersten Schritte (Suche bis Akquise) in gastro-v3.

### 4.2 Das Fakten-Gate

Jede Angabe über einen Betrieb (Öffnungszeiten, Preise, Gerichte, Geschichte, Auszeichnungen,
Bewertungen, Fotos) trägt einen Status:

| Status | Bedeutung | Darf auf die veröffentlichte Seite? |
|---|---|---|
| `bestaetigt` | vom Betrieb bestätigt | ja |
| `uebernommen` | aus einer benannten, unabhängigen Quelle übernommen (Website des Betriebs, Aushang, Speisekarte vor Ort – mit Datum). Google-Places-Inhalte werden nicht gespeichert, nur live mit Google-Logo angezeigt (ADR 0013) | ja, sofern die Quelle die Anzeige erlaubt |
| `vorschlag` | Vorschlag des Studios oder einer KI | nur in der Vorschau, sichtbar als Entwurf markiert; blockiert die Veröffentlichung |
| `unbekannt` | liegt nicht vor | nie |

Kompositionen lesen Betriebsangaben ausschließlich über dieses Gate (Umsetzung: Stufe 1, siehe
MIGRATION.md K1). Fehlen Pflichtangaben, meldet der Build „unvollständig“ mit Begründung, statt
Füllinhalt zu erzeugen.

### 4.3 Anfragen und Betrieb (später, in drei Phasen)

```
 Phase 1 – Conversion-Layer (Stufe 5), ohne Datenbank:
 Kundenseite (Formular) ──► Route Handler: Zod-Validierung, Rate-Limit, Spam-Schutz, Betrieb aus der Route
        ──► E-Mail an den Betrieb + Eingangsbestätigung an den Gast (EmailSenderPort)
        ──► keine Speicherung der Gästedaten

 Phase 2 – Betreiber-Dashboard (Stufe 9):
        … zusätzlich Datenbank (reservation_requests mit Löschfrist) ──► Betriebs-Oberfläche

 Phase 3 – Eigene Bestellstrecke (Stufe 10):
        … Fachregeln (Kapazität, Tische, No-Show) ──► Zahlung (Stripe) ──► Benachrichtigung (Push/Telegram)
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

**Zugriff (später, Stufe 7)**
- Authentifizierung für Studio und Betriebe; Mandantentrennung in der Datenbank (Row Level Security)
  **und** serverseitig geprüft. Ein Test versucht immer den Zugriff auf fremde Daten.
- Schreibende Aktionen mit CSRF-Schutz (bei Server Actions durch Next.js, bei eigenen Routen explizit).
- Öffentliche Endpunkte (Reservierung) mit Rate-Limit und ohne Preisgabe von Kapazitätsdetails.

**HTTP**
- Sicherheits-Header in `next.config.ts` (`X-Content-Type-Options`, `Referrer-Policy`,
  `X-Frame-Options`, `Permissions-Policy`), `X-Powered-By` aus. Eine Content-Security-Policy mit Nonces
  folgt mit den ersten Kundenseiten (eigener ADR).

**Datenschutz**
- **Google Places (ADR 0013):** Dauerhaft gespeichert werden nur die Place-ID, die eigene Analyse und
  unabhängig erhobene Angaben mit Quelle. Andere Places-Inhalte (Name, Adresse, Telefon, Website,
  Bewertung, Öffnungszeiten) werden nicht gespeichert, sondern beim Anzeigen live abgerufen und mit
  Google-Logo gezeigt. Field Masks sind feste, getestete Konstanten; nie Fotos, Rezensionen oder
  Zusammenfassungen. Vor Stufe 8 Policy und Preise erneut prüfen.
- **Demos (ADR 0014):** nicht öffentlich (Token-URL, `noindex`), sichtbar als Konzeptentwurf
  gekennzeichnet, ohne erfundene Fakten.
- Keine Tracker mit Cookies oder Fingerprinting, keine Drittanbieter-Schriften, keine Hotlinks auf
  Bilddienste in Kundenseiten. Cookielose Analytics (Plausible/Umami, EU) nur mit Zustimmung des
  Kunden und Eintrag in dessen Datenschutzerklärung.
- **Fehlertracking (Sentry):** EU-Region, ohne Session-Replay, personenbezogene Daten vor dem Versand
  entfernen.
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
| Resend | Reservierungs- und Abhol-Anfragen, Eingangsbestätigungen, Systemmails | `EmailSenderPort` (Typ vorhanden) | `RESEND_API_KEY`, `EMAIL_FROM` | 5 | Free-Tier vorhanden; Absenderdomain verifizieren. |
| Externe Buchungssysteme (Resmio, OpenTable, Quandoo …), WhatsApp | Vorhandene Reservierungswege des Betriebs einbinden | zunächst nur Links im Content-Modell | – | 1 (Modell), 5 (Seite) | Keine Einbettung fremder Skripte ohne ADR (Datenschutz, Performance). |
| Vercel | Hosting, Preview-URLs für Demos, Custom Domains; später automatisierte Deployments je Kunde | `DeploymentPort` (entsteht bei Bedarf) | `VERCEL_TOKEN` (erst mit Automatisierung) | 4 (Previews), 6 (live) | Hobby-Tarif laut Vercel nur für nicht-kommerzielle Nutzung → vor dem ersten Live-Kunden Pro. Die App bleibt auf jedem Node-Host lauffähig. |
| Cloudflare | Domains, DNS, TLS | – (manuell, später ggf. Port) | – | 6 | Gering; Domain gehört idealerweise dem Kunden. |
| Sentry | Fehlertracking (Formulare, API-Fehler) | `ErrorReporter` (entsteht mit Stufe 6) | (Stufe 6) | 6 | Free-Tier; EU, ohne Session-Replay, PII-Filter. |
| Plausible oder Umami | Cookielose Website-Statistik je Kunde | – (Skript-Einbindung je Seite) | (Stufe 6) | 6 | Nur mit Zustimmung des Kunden; EU-Hosting. |
| Supabase | Postgres, Auth, Storage (Bilder, Logos, Speisekarten-PDFs als Quelle) | Repositories je Fachbereich (entstehen mit Stufe 7) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (nur Server) | 7 | Free-Tier (inaktive Projekte werden pausiert); Pro für Produktivbetrieb; EU-Region. Keine Migration vor Stufe 7. |
| Google Places API (New) | Lead-Recherche | `PlacesSearchPort` + feste Field Masks (`places-fields.ts`) | `GOOGLE_PLACES_API_KEY` | 8 (bis dahin gastro-v3) | Lead-Suche ist Enterprise-SKU (wegen `websiteUri`); Budget-Alarm setzen; nur Place-IDs speichern (ADR 0013). |
| KI-Anbieter (Anthropic) | Textentwürfe, Audit-Zusammenfassungen, Briefing- und Direction-Vorschläge | `TextAssistantPort` (entsteht bei Bedarf) | `ANTHROPIC_API_KEY` | 3+ | Optional; Ergebnisse immer Status `vorschlag`. |
| Stripe | Zahlungen der eigenen Bestellstrecke | `PaymentPort` (Stufe 10) | (Stufe 10) | 10 | Transaktionsgebühren; erst mit Phase 3. |
| Web Push / Telegram | Benachrichtigung des Betriebs | `NotificationPort` (später) | (später) | 9–10 | Kostenlos; Referenz: v1/v3-Umsetzung. |

## 7. Betrieb und Qualitätssicherung

- **Checks:** `npm run check` (ESLint, Typprüfung, Vitest) und `npm run build` laufen lokal und in CI
  (`.github/workflows/ci.yml`) bei jedem Push und Pull Request.
- **Health-Check:** `GET /api/health` – `200` mit `status: "ok"` oder `503` mit `status: "degraded"`,
  nie gecacht, ohne Konfigurationswerte. Details: [`docs/decisions/0006-health-check.md`](docs/decisions/0006-health-check.md).
- **Tests:** Vitest für `domain` und `server` (Ports durch Fakes ersetzt), Vertragstests für Adapter
  gegen aufgezeichnete Antworten (später), Playwright für kritische Abläufe und Screenshot-Review (später).
- **Umgebungen:** lokal (`.env.local`), Preview, Produktion. Konfiguration nur über Umgebungsvariablen.
