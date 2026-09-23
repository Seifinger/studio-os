# ROADMAP.md – Produktplan in Stufen

Stand: 23.09.2026 · Grundlage: Produktplan des Inhabers (Stack, Zielarchitektur, Phasen für
Reservierung/Bestellung, Kostenrahmen) abgeglichen mit `MIGRATION.md` und der Foundation.
Entscheidung dazu: [`docs/decisions/0012-produktplan-uebernommen.md`](docs/decisions/0012-produktplan-uebernommen.md).

> **Ein gemeinsames System im Hintergrund, aber für den Kunden immer eine eigenständige Website.**

## 1. Rollen der Repositories

| Repository | Rolle bis auf Weiteres |
|---|---|
| `gastro-v3` | **Vertriebs- und Recherche-Prototyp**: Google-Places-Suche, Scoring, Website-Audit, lokale Konzept-Demos, persönliche Akquise. Läuft weiter, wird aus studio-os heraus nicht verändert. CI ist grün (Lauf #7 auf `main` @ `ddcad23`, Ubuntu + Windows); der Suchbutton-Fehler ist mit PR #2 behoben. |
| `gastro-webagentur` | Referenz (v1-Betriebslogik, v2-Art-Direction-Erkenntnisse). Nur lesen. |
| `studio-os` | **Produktionsplattform**: Kundenwebsites, später Studio-Dashboard, Betreiber-Dashboard und Lead-Recherche. Der erste echte Kunde wird bewusst das Referenzprojekt. |

## 2. Stack (Zielbild)

| Bereich | Wahl | Ab Stufe | Status |
|---|---|---|---|
| Sprache, Framework | TypeScript, Next.js (App Router) | 0 | ✅ Foundation |
| Styling | Tailwind CSS + eigene Komponenten | 0 | ✅ Foundation |
| Validierung, Tests | Zod, Vitest, Playwright | 0 | ✅ Foundation |
| Funktionale Komponenten | Radix UI (headless) / shadcn/ui als Quellcode – **nur Funktionales**, nie als Optik von Kundenseiten | 5 (erstes Formular) bzw. 7 (Dashboard) | geplant, ADR bei Einführung |
| E-Mail | Resend | 5 | Port vorhanden |
| Hosting | Vercel (Preview-URLs für Demos, Custom Domains) | 4 (Previews), 6 (Livegang) | Hobby nur nicht-kommerziell → Pro vor erstem Live-Kunden |
| Domains, DNS | Cloudflare | 6 | geplant |
| Fehlertracking | Sentry (EU, ohne Session-Replay, PII-Filter) | 6 | geplant |
| Analytics | Plausible oder Umami (cookielos, EU) – nur mit Zustimmung des Kunden | 6 | geplant |
| Datenbank, Auth, Dateien | Supabase (Postgres, Auth, Storage, EU-Region) | 7 | Env-Schema vorbereitet |
| Lead-Daten | Google Places API (New), nur serverseitig | 8 | Port + Field-Mask-Regeln vorhanden |
| KI | Claude Code; Anthropic-API gezielt (Textentwürfe, Audit-Zusammenfassungen, Briefing-Vorschläge) | 3+ | optional |
| Zahlungen | Stripe | 10 | bewusst spät |

## 3. Stufen

Jede Stufe ist eine eigene Aufgabe mit Freigabe. „K…“ verweist auf die Übernahmekandidaten in
`MIGRATION.md`.

| Stufe | Inhalt | Kandidaten | Ergebnis / Kriterium „fertig“ |
|---|---|---|---|
| **0 · Foundation** ✅ | Dokumente, Next.js-Grundgerüst, Health-Check, Checks, Ports | K6 (Kontrast) | `check`, `build`, E2E grün |
| **1 · Fachkern und Content-Modell** | Provenienz je Angabe (Fakten-Gate), Briefing mit Fragenkatalog, Content-Modell: Speisekarte, Öffnungszeiten, CTAs (Telefon, WhatsApp, Reservierungsanfrage, externes Buchungssystem wie Resmio/OpenTable/Quandoo), stabiler Hash | K1, K2, K16 | Reine Zod-Schemas + Funktionen, vollständig getestet |
| **2 · Inhaltsqualität** | Copy-Regeln gegen KI-Floskeln (melden + Vorschlag), Katalog verbotener Muster, Fakten-Gate fürs Rendering | K7, K8, K18 | Regeldaten mit Positiv-/Negativtests |
| **3 · Design Directions und Art Direction** | Design-Direction-Schema (Stilrichtung, Tokens, Layout-Vokabular), Creative Direction je Haus, Bildplan, Schriftregister mit Lizenzen, Referenzkatalog sichten | K9–K12, K19 | Zwei gegensätzliche Directions dokumentiert und validiert |
| **4 · Referenzprojekt: erste Kundenseite** | Komposition für den ersten echten Kunden (bevorzugt) oder einen klar fiktiven Piloten; *Design zuerst*. Demo-Modus mit nicht öffentlichen Vorschau-Links (ADR 0014). Screenshot-Review vorbereiten | K17 | Seite besteht Review + Tauschprobe; LCP/CLS/INP im Budget |
| **5 · Conversion-Layer (Phase 1)** | Reservierungsanfrage und Abhol-Anfrage **ohne Zahlung** per E-Mail (Resend) an den Betrieb + Eingangsbestätigung an den Gast; Rate-Limit, Spam-Schutz, keine Speicherung von Gästedaten in dieser Stufe; Telefon-/WhatsApp-CTA, Links zu vorhandenen Buchungssystemen | – | Anfrage kommt an, Fehlerfälle getestet, keine Datenbank nötig |
| **6 · Livegang** | Vercel-Projekt (kommerzieller Tarif), Kundendomain über Cloudflare, Sentry, optional cookielose Analytics, Content-Security-Policy, Impressum/Datenschutz je Kunde, `OPERATIONS.md` (Deployment, Domain, Störungen) | – | Erster Kunde live |
| **7 · Datenbank und Studio-Dashboard** | *Ausdrücklich geplanter Dashboard-Schritt*: Supabase-Schema und erste Migration (organizations, restaurants, website_projects, menus, media_assets …), Auth, Row Level Security, Storage, `SECURITY.md`. Prüfen, ob Studio und Kundenseiten getrennt deployt werden (Workspaces) | K14 | Fremdzugriff-Tests grün; keine Migration vorher |
| **8 · Lead-Recherche in studio-os** | Temporäre Rechercheansicht (Places live, nichts gespeichert außer Place-ID), manueller Import, Website-Audit mit SSRF-Schutz, **Need Score** + **Close Score**, Design-Direction-Vorschlag, Konzept-Demo. Löst gastro-v3 als Vertriebswerkzeug ab | K3, K4, K5 | gastro-v3 wird nicht mehr gebraucht |
| **9 · Betreiber-Dashboard (Phase 2)** | Ab 3–5 aktiven Kunden: Speisekarte und Tageskarte pflegen, Öffnungszeiten, Bilder hochladen, Reservierungsanfragen einsehen, Änderungen zur Freigabe markieren, Monatsreport | K15 | Betrieb pflegt selbst, Studio gibt frei |
| **10 · Eigene Bestellstrecke (Phase 3)** | Warenkorb, Abholzeitfenster, Varianten/Extras, Stripe, Küchen-/Telegram-Benachrichtigung, Bestellstatus, Storno/Erstattung; ggf. Tischlogik und No-Show-Schutz | K13 | Eigenes Produkt mit eigener Freigabe |

## 4. Reservierung und Bestellung – bewusst in drei Phasen

1. **Conversion-Layer (Stufe 5):** löst für die meisten kleinen Betriebe das eigentliche Problem –
   ohne Zahlungs-, Storno- und Kapazitätslogik.
2. **Betreiber-Dashboard (Stufe 9):** erst wenn mehrere Kunden die Pflege selbst übernehmen wollen.
3. **Eigene Bestellstrecke (Stufe 10):** ein eigenes Softwareprodukt; nie das erste Umsatzhindernis.

Die ausgereifte v1-Betriebslogik (Tische, Kapazität, No-Show) bleibt bis Phase 3 Referenz.

## 5. Zielstruktur und heutige Abbildung

Der Plan sieht ein Monorepo mit `apps/` und `packages/` vor. studio-os startet bewusst als eine
Next.js-App mit geprüften Modulgrenzen (ADR 0003); jede Grenze entspricht schon heute einem
späteren Paket:

| Plan (Monorepo) | studio-os heute | Wird zum Paket, wenn … |
|---|---|---|
| `apps/websites` | `src/app/(sites)` + `src/compositions` (ab Stufe 4) | Kundenseiten unabhängig vom Studio deployt werden sollen |
| `apps/dashboard` | `src/app/(studio)` + `src/ui` (ab Stufe 7) | Studio eine eigene Sicherheitsgrenze/Domain bekommt |
| `apps/customer-portal` | `src/app/(betrieb)` (ab Stufe 9) | wie Dashboard |
| `packages/ui` | `src/ui` | eine zweite App es braucht |
| `packages/design-system` | `src/domain/design` (Directions, Tokens) + `src/compositions` | – |
| `packages/site-generator` | `src/compositions` + `src/server/sites` | – |
| `packages/scoring-engine` | `src/domain/leads` | – |
| `packages/integrations` | `src/server/integrations` | – |
| `packages/content-model` | `src/domain/content` + `src/domain/provenance` | – |
| `supabase/migrations`, `seed` | `supabase/` (ab Stufe 7) | – |
| `docs/SECURITY.md`, `OPERATIONS.md` | heute ARCHITECTURE.md §5; eigene Dateien ab Stufe 6/7 | – |

Spätestens mit Stufe 7 wird entschieden, ob Studio/Betreiber-Dashboard und öffentliche Kundenseiten
getrennt deployt werden. Das ist der eigentliche Auslöser für Workspaces, nicht die Ordnerzahl.

## 6. Kostenrahmen

Angaben laut Produktplan (Anbieterseiten, Stand 09/2026) – vor jedem Vertragsabschluss neu prüfen.

| Dienst | Start | Wann bezahlt |
|---|---|---|
| GitHub | 0 € | – |
| Google Places | nutzungsabhängig, Budget-Alarm setzen | ab Stufe 8; Enterprise-Felder (Website, Telefon, Bewertung) kosten mehr – ADR 0013 |
| Vercel | Hobby 0 € (nur nicht-kommerziell) | Pro vor dem ersten kommerziellen Livegang (laut Plan ca. 20 USD/Monat je Nutzer) |
| Supabase | Free (inaktive Projekte werden pausiert) | Pro (laut Plan 25 USD/Monat), sobald Produktivbetrieb nötig |
| Resend | Free (laut Plan 3.000 Mails/Monat, max. 100/Tag) | bei Wachstum |
| Cloudflare | gering (Domains) | ab Stufe 6 |
| Sentry | Free zum Start | ab Stufe 6 |
| Stripe | nur Transaktionsgebühren | ab Stufe 10 |
