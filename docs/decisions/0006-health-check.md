# 0006 – Health-Check `/api/health`

- **Status:** angenommen
- **Datum:** 2026-09-23
- **Bezug:** `src/server/health.ts`, `src/app/api/health/route.ts`

## Kontext

Die Foundation braucht einen prüfbaren Endpunkt für Monitoring und Deployments. Er ist öffentlich
erreichbar und darf deshalb nichts über die Konfiguration verraten.

## Entscheidung

- `GET /api/health` liefert JSON nach `healthReportSchema`:
  `{ status: "ok" | "degraded", service: "studio-os", version, timestamp, checks: [{ name, status, detail? }] }`.
- HTTP `200` bei `ok`, `503` bei `degraded` – so reagieren Load Balancer und Uptime-Dienste ohne
  JSON-Auswertung.
- `Cache-Control: no-store, max-age=0`; Route Handler sind in Next.js 16 ohnehin nicht gecacht
  (Build-Ausgabe: `ƒ /api/health`).
- Einzige Prüfung heute: `config` (Umgebungsvariablen gültig). Die öffentliche Antwort nennt nur die
  Anzahl der Probleme; Variablennamen gehen ins Server-Log (`console.error`), Werte nirgendwohin.
- Weitere Prüfungen (Datenbank erreichbar …) kommen mit ihren Integrationen dazu.

## Betrachtete Alternativen

- **Variablennamen öffentlich melden:** bequemer beim Debuggen, verrät aber, welche Integrationen
  existieren und fehlkonfiguriert sind.
- **Externe Dienste bei jedem Aufruf anpingen:** kostet Geld/Kontingent und macht den Endpunkt
  zum Lastverstärker. Wenn nötig, später mit kurzem Cache.

## Konsequenzen

- Monitoring kann sofort eingerichtet werden. Der Endpunkt ist getestet (Unit + Route + E2E).
