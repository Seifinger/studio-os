# 0011 – Widersprüchliche Designregeln der Referenzen auflösen

- **Status:** angenommen
- **Datum:** 2026-09-23
- **Bezug:** DESIGN.md Abschnitt 3; MIGRATION.md B6, B7, B12; Quellen: `gastro-webagentur/v2/build/schriften.js`,
  `v2/build/antiSlopLint.js`, `v2/ART-DIRECTION-AUDIT.md` (@bd23138), `gastro-v3/src/tokens/typography.json`,
  `src/blueprints/hero-video`, `src/renderer/fonts.js` (@ddcad23)

## Kontext

Die Referenzen widersprechen sich: v2 verbietet Inter, DM Sans, `system-ui` und Glasmorphismus;
v1 nutzt Inter als Textschrift; v3 nutzt DM Sans, „Liquid Glass“ und lädt Schriften von Google.
v1/v2 hosten Schriften aus DSGVO-Gründen lokal. Der v2-Judge bewertete austauschbare Seiten mit 10/10.

## Entscheidung

1. **Schriften auf Kundenseiten:** die v2-Verbotsliste gilt (S1), ergänzt um Lato. Schriften werden
   selbst gehostet (keine Google-Server). Die Studio-UI ist ausgenommen (0007).
2. **Glasmorphismus:** standardmäßig verboten (S3); Ausnahme nur mit begründeter Creative Direction
   und Kontrastnachweis ohne Unschärfe.
3. **Qualitätsmessung:** keine Punktzahl als Qualitätsbeleg (P2). Automatische Prüfungen sichern
   Untergrenzen; das Urteil fällt im Review mit Tauschprobe (P1).
4. **Gestaltungsvarianz:** aus dem Briefing begründet, nie per Seed-Lotterie (S9).

## Betrachtete Alternativen

- **v3 als Maßstab nehmen, weil neuer:** v3 wiederholt Muster, die der v2-Audit mit Belegen als
  generisch identifiziert hat.
- **Nichts verbieten, nur im Review bewerten:** zu weich; die Verbote sind billig durchzusetzen und
  verhindern die häufigsten Fehler.

## Konsequenzen

- Die Verbotslisten werden in Stufe 2 als Regeldaten mit Tests umgesetzt.
