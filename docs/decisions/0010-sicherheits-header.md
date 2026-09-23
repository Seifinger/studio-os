# 0010 – Sicherheits-Header, Content-Security-Policy später

- **Status:** angenommen
- **Datum:** 2026-09-23
- **Bezug:** `next.config.ts`, ARCHITECTURE.md Abschnitt 5

## Kontext

Auch eine Foundation-App sollte mit sicheren Standards ausgeliefert werden. Eine strikte
Content-Security-Policy braucht in Next.js Nonces über Middleware bzw. Proxy und macht jede Seite
dynamisch – das lohnt sich erst mit echten Seiten und bekannten Quellen (Bilder, Schriften, Formulare).

## Entscheidung

Für alle Pfade: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
`X-Frame-Options: DENY`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`;
`poweredByHeader: false`. Die CSP folgt in einem eigenen ADR mit den ersten Kundenseiten (Stufe 4).
HSTS setzt die Hosting-Plattform bzw. der Reverse Proxy.

## Konsequenzen

- Der E2E-Smoke-Test prüft `X-Content-Type-Options` stellvertretend.
- `X-Frame-Options: DENY` verbietet Einbettung – falls Kundenseiten später eingebettet werden sollen
  (z. B. Vorschau im Studio), wird das pro Route gelockert.
