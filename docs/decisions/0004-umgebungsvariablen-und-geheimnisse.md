# 0004 – Umgebungsvariablen und Geheimnisse

- **Status:** angenommen
- **Datum:** 2026-09-23
- **Bezug:** `src/server/env.ts`, `.env.example`, ARCHITECTURE.md Abschnitt 5; Produktprinzip 7

## Kontext

Später braucht studio-os Schlüssel für Google Places, Supabase, Resend, Vercel und einen
KI-Anbieter. In der Foundation darf kein Schlüssel Voraussetzung sein. v1 ließ das
Dashboard-Token optional und lief ohne Schutz weiter (MIGRATION.md B8).

## Entscheidung

- `src/server/env.ts` ist die einzige Stelle, die `process.env` liest. Ein Zod-Schema beschreibt
  alle bekannten Variablen; in der Foundation sind alle Integrationsvariablen optional.
- Leere Werte (`KEY=`) gelten als nicht gesetzt.
- Zusammengehörige Variablen sind nur gemeinsam gültig (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`,
  `RESEND_API_KEY` + `EMAIL_FROM`). Eine halbe Konfiguration ist ein Fehler, keine abgeschaltete
  Integration.
- `parseServerEnv` wirft nicht, sondern liefert Probleme mit Variablennamen, **nie mit Werten**.
- Variablen mit `NEXT_PUBLIC_`-Präfix, deren Name nach Geheimnis aussieht (KEY, SECRET, TOKEN,
  PASSWORD, PRIVATE, CREDENTIAL), sind ein Fehler. Für den Browser gedachte öffentliche Schlüssel
  (z. B. ein Supabase publishable key) kommen nur per ADR auf eine Freigabeliste.
- `.env.example` enthält nur Namen; ein Test prüft, dass sie keine Werte enthält und genau die
  Variablen des Schemas beschreibt.

## Betrachtete Alternativen

- **`@t3-oss/env-nextjs`:** gute Bibliothek, aber für acht Variablen eine zusätzliche Abhängigkeit;
  das Schema ist in Zod ebenso kurz.
- **Beim Start werfen:** zu früh, solange keine Variable Pflicht ist. Wird eine Integration
  Pflicht, wirft ihr Adapter `IntegrationNotConfiguredError`, und der Health-Check meldet `degraded`.

## Konsequenzen

- Jede neue Variable braucht: Schema-Eintrag, `.env.example`, Zeile in ARCHITECTURE.md Abschnitt 6.
- Fehlkonfiguration fällt im Health-Check auf (503), nicht erst beim ersten Kundenaufruf.
