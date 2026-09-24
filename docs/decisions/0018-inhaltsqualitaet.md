# 0018 – Inhaltsqualität: Copy-Regeln, Musterkatalog, Build-Gate

- **Status:** angenommen
- **Datum:** 2026-09-23
- **Bezug:** `src/domain/quality/`, `src/domain/color/hsl.ts`; DESIGN.md §3; MIGRATION.md K7, K8, K18;
  Quellen: `gastro-webagentur/v2/build/copyRefiner.js`, `v2/COPY-PRINZIPIEN.md`, `v2/build/antiSlopLint.js`,
  `gastro-v3/src/judge/index.js`

## Entscheidung

1. **Copy-Regeln als Daten** (`COPY_RULES`): je Regel ID, Schwere (`fehler`/`hinweis`), Muster,
   Begründung und optional ein Vorschlag. `checkCopy` meldet, `checkPageCopy` ergänzt die seitenweite
   Regel „höchstens ein Ausrufezeichen“, `proposeCopy` erzeugt eine überarbeitete Fassung.
   - **Nie stilles Umschreiben** (anders als v2): Ein Vorschlag ist eine Angabe mit Status `vorschlag`,
     die ein Mensch bestätigt. In Builds zählen `fehler`-Befunde als Abbruchgrund, `hinweis` nicht.
   - **Unicode-sichere Wortgrenzen** (`(?<!\p{L})`) statt `\b`, das „ä“ als Wortgrenze behandelt.
     Negativbeispiele in den Tests („Willkommensgetränk“, „Perfektionist“, „Wirklichkeit“) sichern das ab.
2. **Musterkatalog S1–S10** als Daten mit Kennzeichnung, welche Regeln automatisch prüfbar sind (S1, S2,
   S3, S4, S5, S7). `checkStylesheet` und `checkMarkup` arbeiten mit einfachen Textprüfungen ohne
   eigenen Parser (v2 hatte einen eigenen HTML/CSS-Parser, MIGRATION.md §4). Verläufe gelten erst ab zwei
   *verschiedenen Farbtönen* als Verstoß; Grau- und Tonstufen desselben Tons sind erlaubt. Harte
   Versatzschatten sind erlaubt, Leuchtschatten nicht. `©`, `®`, `™` und Bewertungssterne sind keine Emoji.
3. **Build-Gate** `assertRenderable(profile, context)`: wirft `RenderGateError`, wenn das Fakten-Gate einen
   Verstoß meldet. Für live zusätzlich Pflicht: `publicationApproved` mit Status `bestaetigt` – eine
   „übernommene“ Freigabe gibt es nicht.

## Konsequenzen

- Kompositionen (Stufe 4) rufen `assertRenderable` vor dem Rendern auf; die Demo-Tests führen die
  Copy- und Musterprüfung über alle Texte und das ausgelieferte CSS/Markup aus.
- Die Regeln melden Untergrenzen; sie ersetzen nicht das Review (DESIGN.md P2).
