# 0007 – System-Schriften für die Studio-UI

- **Status:** angenommen
- **Datum:** 2026-09-23
- **Bezug:** DESIGN.md Abschnitte 2, 4, 9; `src/app/globals.css`

## Kontext

DESIGN.md (Regel S1) verbietet Template-Standardschriften inklusive `system-ui` für Kundenseiten.
Das Studio ist aber funktionale UI: Es soll schnell, dicht und lesbar sein und nicht wie eine
Kundenseite aussehen.

## Entscheidung

Die Studio-UI nutzt System-Schriften (`ui-sans-serif`, `-apple-system`, `Segoe UI`, … und
`ui-monospace` …). Kundenseiten nutzen sie nie; dort gilt das Schriftregister mit selbst
gehosteten, lizenzierten Schriften.

## Betrachtete Alternativen

- **`next/font/google`:** lädt beim Build von Google und hostet dann selbst – braucht Netz beim Build
  und eine Lizenzdokumentation, ohne dass das Studio davon gewinnt.
- **Eine eigene Studio-Hausschrift:** möglich, wenn das Studio eine Marke bekommt; eigenes ADR.

## Konsequenzen

- Keine Web-Fonts im Studio: kein CLS durch Schriftwechsel, keine externen Anfragen.
- Die Darstellung unterscheidet sich leicht je Betriebssystem – für ein internes Werkzeug akzeptiert.
