# 0001 – Neubau statt Fork der Referenzprojekte

- **Status:** angenommen
- **Datum:** 2026-09-23
- **Bezug:** MIGRATION.md; Referenzen `gastro-webagentur@bd23138`, `gastro-v3@ddcad23`

## Kontext

Es gibt zwei Vorgängerprojekte mit wertvoller Fachlogik, aber drei parallelen Seiten-Engines,
zwei Provenienzmodellen, doppeltem Scoring und Places-Client, widersprüchlichen Designregeln und
eingecheckten Build-Ausgaben (MIGRATION.md, Abschnitt 2). Beide sind JavaScript ohne Typen, HTML
entsteht per String-Konkatenation.

## Entscheidung

studio-os ist ein eigenständiges Repository und wird neu aufgebaut. Die Referenzen werden nur
gelesen. Übernommen werden Regeln, Datenmodelle und Testfälle – als Spezifikation, neu geschrieben
in TypeScript mit Tests. Jede Übernahme nennt ihre Quelle in einem ADR. Ein Architekturtest
verbietet Importe aus den Referenzen.

## Betrachtete Alternativen

- **gastro-v3 forken und erweitern:** v3 ist die sauberste Referenz, aber String-HTML, keine Typen,
  Express-Server und Google-Fonts-CDN müssten fast vollständig ersetzt werden. Ein Fork würde die
  Altlasten als Ausgangslage festschreiben.
- **Monorepo mit beiden Projekten als Paketen:** macht aus drei Engines keine – das Gegenteil des Ziels.
- **Dateien selektiv kopieren:** schnell, aber genau das „Patchwork“, das vermieden werden soll.

## Konsequenzen

- Mehr Aufwand je Übernahme, dafür typsichere, getestete Module mit einheitlichen Modellen.
- Die Tests der Referenzen sind die wichtigste Übernahmequelle und müssen je Stufe gelesen werden.
- Die Referenzen bleiben lauffähig und unverändert; studio-os hängt nicht von ihnen ab.
