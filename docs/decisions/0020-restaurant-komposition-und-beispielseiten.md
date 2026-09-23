# 0020 – Restaurant-Komposition, Beispielseiten und statischer Export

- **Status:** angenommen
- **Datum:** 2026-09-23
- **Bezug:** ROADMAP Stufe 4; ADR 0014, 0015, 0016, 0018, 0019; `src/compositions/restaurant/`,
  `src/catalog/showcases/`, `src/app/beispiele/`, `next.config.ts`, `src/domain/publishing/`

## Kontext

Stufe 4 braucht Demos ohne echten Kunden: je Küche ein erfundenes Haus (öffentlich) und
personalisierte Lead-Demos (lokal, ADR 0021). Beide sollen aus derselben Kompositionslogik entstehen,
die Tauschprobe bestehen (DESIGN.md §10) und kostenlos über GitHub Pages erreichbar sein.

## Entscheidung

1. **Eine Komposition, viele Häuser.** `RestaurantSite` rendert aus Profil + Design Direction +
   Creative Direction. Reihenfolge, Gewicht (`gross|normal|klein`) und eigene Überschriften der
   Abschnitte kommen aus der Dramaturgie; Signature-Details heben belegte Abschnitte hervor. Jede
   Angabe läuft über das Fakten-Gate; `assertRenderable` bricht das Rendern bei Verstößen ab.
2. **Aussehen nur über Tokens.** `theme.ts` übersetzt die Direction in CSS-Variablen; CSS-Module
   enthalten keine Farbwerte (Test). Der Hero hat zwei Satzarten: *split* (Name + Tafel mit dem, was
   heute gilt) und *immersive* (Plakat: Name auf zwei ausgewogenen Zeilen, gedeckelt über Breite und
   Fensterhöhe, damit Einleitung und Handlung auf dem ersten Bildschirm bleiben).
3. **Bewegung nach DESIGN.md §6.** `quiet` bewegt nichts; `editorial`/`expressive` heben
   Abschnittsköpfe über Scroll-Timelines leicht an (Deckkraft nie unter 0,4), `expressive` setzt den
   Namen einmal beim Laden (nur Verschiebung). Alles nur unter `prefers-reduced-motion:
   no-preference`; ohne Unterstützung steht alles sofort da (E2E prüft 0 Animationen bei reduce).
4. **Beispielhäuser** (`src/catalog/showcases/`): 14, eines je Küche und Direction, jede Angabe
   `fiktiv`. `defineShowcase` prüft beim Laden: Schema, nur Rufnummern 089 99998 1xx (von der
   Bundesnetzagentur für Film und Fernsehen freigehalten), nur Postleitzahlen 00xxx (nicht vergeben),
   gültige Creative Direction. Keine Gästestimmen, keine Fotos – Bildplätze bleiben sichtbare
   Foto-Aufgaben. In Beispielen führen Anruf, Route und Buchung zur Besuchs-Sektion statt zu
   `tel:`/Maps-Links; Formulare sind gesperrt und sagen das.
5. **Zwei Build-Ziele** über `STUDIO_BUILD_TARGET`: `live` (Standard) und `showcases` (statischer
   Export nach `out/`, `trailingSlash`, `basePath` aus `SHOWCASE_BASE_PATH`). Dateien mit
   `.live.tsx/.live.ts` (Studio-Start, Health-Check, Lead-Demos) gehören über `pageExtensions` nur
   zum Live-Build; `page.export.tsx` ist die Startseite des Exports.
6. **Veröffentlichungsprüfung** (`npm run check:export`) gegen die fertigen Dateien: noindex auf jeder
   Seite, Pflichthinweis, keine Schlüssel, keine fremden Skripte/Stylesheets, keine Wähl- oder
   Maps-Links, keine Lead-Demos, `.nojekyll` vorhanden, Betreiberangaben gesetzt.
7. **Impressum und Datenschutz** der Beispielseiten lesen den Betreiber aus
   `STUDIO_OPERATOR_NAME/ADDRESS/EMAIL` – personenbezogen, daher nicht im Repository. Ohne sie zeigt
   die Seite das offen an, und die Prüfung schlägt fehl.
8. **Veröffentlichung** per manuellem Workflow `publish-showcases.yml` in ein separates öffentliches
   Repository (Deploy-Key); `studio-os` bleibt privat. CI baut den Export mit Platzhalter-Betreiber
   nur zur Prüfung.
9. **Schriften:** Eine Beispielroute bindet alle 38 `@font-face`-Dateien des Registers ein
   (~57 KB CSS unkomprimiert); Browser laden nur die woff2-Dateien, die eine Seite nutzt. Kundenseiten
   bekommen später nur ihre eigenen Schriften.

## Betrachtete Alternativen

- **Eine Vorlage mit Farbvarianten:** schneller, aber genau das generische Muster, das DESIGN.md
  verbietet; die Tauschprobe scheitert.
- **Getrennte Root-Layouts für Studio und Kundenseiten:** sauberer Schnitt, aber mehrere Root-Layouts
  brauchen eine globale 404 und vollständige Seitenwechsel; aufgeschoben bis Stufe 7.
- **Relative Links statt `next/link`:** funktionieren nur mit `trailingSlash` in beiden Build-Zielen;
  `next/link` ergänzt den `basePath` zuverlässig.
- **Third-Party-Action für das Deployment:** eine Abhängigkeit mehr in der Lieferkette; ein paar
  Zeilen `git push` mit Deploy-Key reichen.

## Konsequenzen

- Neue Häuser oder Kundenseiten sind Daten (Profil, Creative Direction, Bildplan), kein neuer Code.
- Rechtstexte der Beispielseiten vor der ersten Veröffentlichung prüfen lassen.
- GitHub Pages bleibt nur für Beispielseiten; Kundenseiten gehen in Stufe 6 auf einen kommerziell
  zulässigen Host.
