# 0019 – Design Directions, Schriftregister, Creative Direction, Bildplan

- **Status:** angenommen
- **Datum:** 2026-09-23
- **Bezug:** `src/domain/design/`, `src/catalog/directions.ts`; DESIGN.md §4, §5, §10; MIGRATION.md K9–K12, K19;
  Quellen: `gastro-webagentur/v2/designsysteme/*.md` (Referenzen), `v2/creative/creativeDirection.js`,
  `v2/assets-pipeline/bildplan.js`, `v2/build/schriften.js` (@bd23138)

## Entscheidung

1. **Schriften selbst gehostet über Fontsource** (24 Familien, alle SIL OFL 1.1, exakt gepinnt als
   Laufzeitabhängigkeiten). Eingebunden wird je Schnitt die Paket-CSS mit `unicode-range` für alle
   Zeichensätze – die Teil-Dateien je Zeichensatz haben keine `unicode-range` und würden sich
   gegenseitig überschreiben. Ausnahme: Zen Kaku Gothic New nur lateinisch (die volle CSS hat 108 KB
   Japanisch). Das Register (`fonts.ts`) prüft per Test: nicht auf der Verbotsliste S1, gepinnt,
   installiert, OFL, Familienname stimmt mit der CSS überein.
   - Alternativen: `next/font/google` (lädt beim Build von Google, braucht Netz); Dateien ins Repo kopieren
     (Binärdateien ohne Paketverwaltung); `next/font/local` (keine `unicode-range` je Datei).
   - Kosten: 63 MB in `node_modules`; ausgeliefert werden nur die tatsächlich benutzten Schnitte.
2. **Design-Direction-Schema** nach DESIGN.md §10, mit harten Prüfungen (`directionProblems`):
   Kontrast je Farbrolle (Text, Nebentext, Primär, Schrift auf Primär ≥ 4,5 : 1; Akzent ≥ 3 : 1),
   mindestens eine Restaurant- und eine Design-Referenz, keine Floskel in der Stimmung, kein
   „cinematic“ ohne eigenes Material, keine Google-Referenzen.
3. **14 Directions im Katalog**, eine je Küche. Referenzen aus dem v2-Katalog mit „übernommen/bewusst
   nicht“; alle `verified: false`, weil sie noch niemand von Hand angesehen hat. Ein Test erzwingt je
   Direction eine eigene Display-Schrift und eine eigene Kombination aus Hero-, Karten- und
   Galerie-Layout – die Katalog-Ebene der Tauschprobe.
4. **Creative Direction** je Haus: Leitidee, Wirkung, Metapher, Dramaturgie mit „warum“ (beginnt mit
   Hero, enthält Anfahrt, keine Dopplungen), höchstens zwei Signature-Details mit Beleg; ein Detail
   ohne zeigbaren Beleg fällt weg (`checkSignatures`).
5. **Bildplan** je Bildplatz mit Motiv, Rolle, Zuschnitt, Fokus, Alt-Text, Herkunft, Rechten, Freigabe.
   `resolveImageSlot` zeigt ein Bild nur, wenn es freigegeben, selbst gehostet und passend ist
   (Haus/Team/Raum nie Stock, Gerichte nie KI, Stock nur mit dem genannten Gericht). Sonst bleibt
   der Bildplatz sichtbar – als Foto-Aufgabe für den Betrieb.
6. **Neuer Ordner `src/catalog`** für kuratierte Studio-Daten (Directions, später Showcases); er
   importiert nur aus `domain` (Architekturtest Regel 7).

## Konsequenzen

- Vor dem ersten echten Kunden: Referenzen von Hand sichten und `verified` setzen.
- Die Abhängigkeitsliste (ADR 0009) wächst um die Fontsource-Pakete.
