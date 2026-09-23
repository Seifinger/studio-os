# 0008 – Sprache in Code, UI und Dokumentation

- **Status:** angenommen
- **Datum:** 2026-09-23
- **Bezug:** CLAUDE.md Abschnitt 6

## Kontext

Die Referenzen mischen deutsche und englische Bezeichner (`istTatsache`, `scoreProspect`,
`betriebStore`). studio-os soll später auch für andere Branchen und ggf. andere Entwickler
funktionieren; Kunden und Nutzer sind deutschsprachig.

## Entscheidung

- **Code-Bezeichner englisch** (Typen, Funktionen, Dateien, Variablen), weil Bibliotheken, Next.js-
  Konventionen und Werkzeuge englisch sind und die Branchenerweiterung leichter fällt.
- **UI-Texte, Fehlermeldungen für Menschen, Dokumentation und ADRs deutsch.**
- Fachbegriffe ohne treffende Übersetzung dürfen deutsch bleiben (z. B. Status-Werte des
  Provenienzmodells `bestaetigt`, `uebernommen`, `vorschlag`, `unbekannt`, weil sie im Gespräch mit
  Kunden so heißen) – dann aber überall gleich geschrieben.
- Testbeschreibungen deutsch, damit sie als Spezifikation lesbar sind.

## Konsequenzen

- Übernahmen aus den Referenzen werden beim Neuschreiben übersetzt; das ADR der Übernahme nennt die
  Zuordnung der Begriffe.
