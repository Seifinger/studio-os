# 0005 – Externe Dienste nur über Ports

- **Status:** angenommen
- **Datum:** 2026-09-23
- **Bezug:** `src/server/integrations/ports.ts`, ARCHITECTURE.md Abschnitt 6; Produktprinzipien 7–9

## Kontext

Supabase, Resend, Vercel und Google Places sollen vorbereitet, aber nicht vorausgesetzt werden.
Bezahlte Dienste dürfen nicht erzwungen werden. In den Referenzen existierte der Places-Client
dreimal, jeweils direkt mit `fetch` in Server- bzw. Routen-Code.

## Entscheidung

- Jede externe Integration ist eine TypeScript-Schnittstelle („Port“) in `src/server/integrations`.
  Adapter implementieren sie; Fachlogik und Routen kennen nur den Port. Tests nutzen Fakes.
- In der Foundation existieren nur `PlacesSearchPort`, `EmailSenderPort` und
  `IntegrationNotConfiguredError` – als Verträge, ohne SDK und ohne Implementierung.
- Weitere Ports (Repositories für Supabase, Deployment für Vercel, KI, Benachrichtigung) entstehen
  mit ihrer Stufe, nicht auf Vorrat.
- `PlaceCandidate` enthält bewusst keine Fotos und Rezensionen und trägt `retrievedAt` als
  Grundlage für das Ablaufdatum (Produktprinzip 8).

## Betrachtete Alternativen

- **SDKs sofort installieren:** Abhängigkeiten ohne Nutzen, Versuchung zu direkten Aufrufen.
- **Alle Ports vorab entwerfen:** Die Datenbank-Repositories hängen an Entitäten, die erst in
  Stufe 1–6 entstehen; vorab entworfen wären sie Rätselraten.

## Konsequenzen

- Anbieterwechsel (z. B. anderer E-Mail-Dienst, anderer Host als Vercel) betrifft nur einen Adapter.
- Jeder Adapter bekommt Vertragstests gegen aufgezeichnete, anonymisierte Antworten.
