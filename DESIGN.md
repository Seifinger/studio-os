# DESIGN.md – Gestaltungsregeln von studio-os

Stand: 23.09.2026 · Verbindlich für alle Oberflächen. Änderungen an diesen Regeln werden hier zuerst
beschlossen (mit ADR in `docs/decisions/`) und erst dann im Code umgesetzt.

## 1. Grundsatz: Designentscheidung vor Codeentscheidung

Eine Kundenseite beginnt nie mit Code und nie mit einer Vorlage. Die Reihenfolge ist fest:

1. **Briefing** – Was ist dieser Betrieb, belegt durch Angaben mit Status (ARCHITECTURE.md, 4.2)?
2. **Design Direction** – passende Stilrichtung als Startpunkt wählen oder neu belegen (Abschnitt 10).
3. **Creative Direction** – Leitidee in einem Satz, Wirkung auf Gäste, visuelle Metapher, Dramaturgie
   mit Begründung je Abschnitt, höchstens zwei Signature-Details *mit Beleg im Briefing*, bewusster Verzicht.
4. **Designsystem und Bildplan** – Tokens mit Aufgabe, Schriftpaar, Bildplätze mit Motiv, Zuschnitt,
   Herkunft und Rechten.
5. **Komposition** – erst jetzt Code.
6. **Review** – automatische Untergrenzen, dann menschliches Urteil, dann Tauschprobe (Regel P1).

Für Konzept-Demos vor der Beauftragung genügen Schritt 2 und eine knappe Creative Direction; statt
Fakten stehen Platzhalter (ADR 0014).

Referenzen (reale Websites guter Betriebe, kuratierte Stilsammlungen) belegen Entscheidungen; sie
werden analysiert, nie kopiert. Eine Referenz ohne Begründung, *was* übernommen wird und *was bewusst
nicht*, zählt nicht.

## 2. Zwei Welten: funktionale UI und kreative Komposition

studio-os hat zwei grundverschiedene Gestaltungsaufgaben. Sie werden getrennt entworfen, getrennt
gebaut und getrennt geprüft.

| | **Funktionale UI** (`src/ui`, später) | **Kreative Komposition** (`src/compositions`, später) |
|---|---|---|
| Wo | Studio-Werkzeuge, Dashboards, Betriebs-Oberfläche, Formulare im Studio | Die Website eines Betriebs |
| Ziel | Aufgaben schnell, fehlerarm, wiederholbar erledigen | Ein bestimmtes Haus erkennbar machen und Gäste zur Hauptaktion führen |
| Qualität heißt | Konsistenz, Dichte, Lesbarkeit, Vorhersehbarkeit | Eigenständigkeit, Glaubwürdigkeit, Atmosphäre – begründet aus dem Briefing |
| Tokens | Ein stabiles Studio-Token-Set (Abschnitt 9) | Je Betrieb aus dem Designsystem-Dokument |
| Schrift | System-Schriften (schnell, keine Lizenzfrage, kein Netz) | Je Betrieb gewählt, selbst gehostet, Lizenz dokumentiert |
| Varianz | Gering – Abweichung ist ein Fehler | Hoch – aber jede Abweichung braucht einen Grund |
| Komponenten | Generisch benannt und wiederverwendbar (`Button`, `Field`, `DataTable`) | Nach Aufgabe im Haus benannt, durch die Creative Direction parametrisiert; nie 1:1 auf ein zweites Haus übertragen |
| Prüfung | Unit-Tests, Barrierefreiheit, Tastaturbedienung | Fakten-Gate, Copy-Regeln, Screenshot-Review mit Zuständen, Tauschprobe |
| Grundlage | Radix-Primitives (headless) bzw. shadcn/ui als übernommener Quellcode, **umgestellt auf die Studio-Tokens** | Design Direction + Creative Direction (Abschnitt 10); Radix nur headless für Funktionsbausteine |

**Funktionsbausteine auf Kundenseiten** (Reservierung, Bestellung, Öffnungszeiten, Kontakt) sind der
Sonderfall: Ihre *Logik* (Validierung, Zustände, Fehlermeldungen) ist geteilt und liegt in `domain`;
ihr *Aussehen* gehört der Komposition. Ein Reservierungsformular darf nie wie ein Fremdkörper aus dem
Studio aussehen (Befund aus dem v2-Audit) – und das Studio nie wie eine Kundenseite.

`ui` und `compositions` importieren sich nicht gegenseitig (ARCHITECTURE.md, Abschnitt 3).

**Radix und shadcn/ui** sind für Funktionales erlaubt: Formularfelder, Datums- und Zeitauswahl,
Dialog, Dropdown, Toast, Datei-Upload, Tabellen, Login, Cookie-Hinweis. Regeln:
- shadcn/ui ist Quellcode zum Übernehmen, keine Optik. Jede übernommene Komponente wird auf die
  Tokens umgestellt; der Standard-Look (Radien, Schatten, Grautöne, Fokusfarbe) wird nie ausgeliefert.
- Auf Kundenseiten nur Radix-Primitives ohne mitgelieferte Gestaltung; das Aussehen bestimmt die Komposition.
- Hero, Titeltypografie, Bildzuschnitt, Navigationsform, Speisekarten-Darstellung, Farbwelt,
  Seitenrhythmus, Bewegung, Einbindung von Reservierung/Bestellung und Dramaturgie kommen **nie** aus
  einer Komponentenbibliothek.
- Die Abhängigkeit wird mit dem ersten Formular (ROADMAP Stufe 5) bzw. dem Dashboard (Stufe 7) per
  ADR aufgenommen.

## 3. Anti-AI-Slop-Regeln

Diese Regeln gelten für Kundenseiten ohne Ausnahme und – soweit sinnvoll – auch für das Studio.
„S“ = Seite/Sichtbares, „T“ = Text, „P“ = Prozess. Jede Regel hat einen Grund; der Grund entscheidet
Grenzfälle.

### Sichtbares

| # | Regel | Grund |
|---|---|---|
| S1 | **Keine Template-Standardschriften als Markenschrift**: Inter, Roboto, Open Sans, Poppins, Montserrat, DM Sans, Space Grotesk, Lato, `system-ui` sind auf Kundenseiten verboten. | Sie sind die häufigsten Merkmale generierter Seiten. (Entscheidet den Widerspruch v1/v3 ↔ v2, MIGRATION.md B6.) |
| S2 | **Keine mehrfarbigen Verläufe**, keine unbegründeten Lila-/Indigo-Akzente, kein Verlauf als Hintergrund „für Tiefe“. | Standardmotiv von KI-Landingpages; trägt keine Information. |
| S3 | **Kein Glasmorphismus** (`backdrop-filter`-Karten, „Liquid Glass“). Ausnahme nur, wenn die Creative Direction sie begründet *und* ein Kontrastnachweis ohne Unschärfe-Unterstützung vorliegt. | Mode, schlecht lesbar auf wechselnden Bildern, teuer auf schwachen Geräten. (Entscheidet v2 ↔ v3.) |
| S4 | **Keine Reihe aus drei gleich gebauten Karten** (Icon + Überschrift + Satz) als Standardabschnitt. | Die Standardschablone schlechthin; sagt nichts über das Haus. |
| S5 | **Keine Emoji als Icons, keine dekorativen Icon-Bibliotheken.** Gezeichnete, zum Haus gehörende Zeichen nur, wenn die Creative Direction sie vorsieht. Funktionale Icons im Studio sparsam und immer mit Text. | Beliebigkeit; Emoji rendern je System anders. |
| S6 | **Kein Text auf abgedunkeltem Stockfoto als Hero-Standard** (Verlaufsschleier). | Häufigstes Template-Motiv; Lesbarkeit hängt am Bild. |
| S7 | **Keine Pillen-Flut** (alles rund), keine leuchtenden Schatten, keine Schatten auf allem. Radien und Schatten sind Tokens mit Aufgabe. | Weichgespülte Einheitsoptik. |
| S8 | **Kein durchgehend zentriertes Layout.** Asymmetrie ist erwünscht, aber begründet (z. B. Karte links wie die Tafel im Haus) – nie zufällig. | Mittelachse ist der Standard von Generatoren; zufällige Asymmetrie ist nur eine andere Lotterie. |
| S9 | **Keine Gestaltung per Zufall oder Hash.** Varianten werden aus dem Briefing begründet. Ein stabiler Hash darf höchstens zwischen *gleich gut begründeten* Optionen entscheiden. | v1/v2-Befund: „Seed-Lotterie“ erzeugte austauschbare Seiten. |
| S10 | **Keine Stockfotos für Haus, Team oder Raum. Gerichtsfotos zeigen das genannte Gericht.** Jedes Bild hat Herkunft und Rechte im Bildplan. | v2-Audit: falsche Gerichte, dasselbe Teamfoto auf 36 Seiten. |

### Text

| # | Regel | Grund |
|---|---|---|
| T1 | **Keine erfundenen Betriebsfakten**: Öffnungszeiten, Preise, Gerichte, Geschichte, Auszeichnungen, Gästestimmen, Bewertungen, Teamnamen erscheinen nur mit Status `bestaetigt`/`uebernommen`. In Konzept-Demos stehen fehlende Inhalte als erkennbare Platzhalter („Hier steht Ihre Mittagskarte“), nie als Katalog-Gerichte oder -Preise (ADR 0014). Erfundene Inhalte (Status `fiktiv`) nur auf Beispielseiten frei erfundener Betriebe (ADR 0015, 0016). | Produktprinzip 5; rechtlich (UWG) und menschlich. |
| T2 | **Keine KI-Floskeln**: „Willkommen bei …“, „Tauchen Sie ein“, „Lassen Sie sich verwöhnen“, „kulinarische Reise“, „Geschmackserlebnis“, „einzigartig“, „unvergesslich“, „authentisch“, „mit Liebe zubereitet“, „nicht nur …, sondern auch …“, Dreierketten allgemeiner Adjektive. | Behauptete Gefühle statt Dinge. Vollständige Liste mit Begründung: Referenz `v2/COPY-PRINZIPIEN.md`, Übernahme als Regeldaten in Stufe 2. |
| T3 | **Ein guter Satz nennt eine Sache und einen Beleg** – ein Gericht, eine Uhrzeit, eine Herkunft, einen Handgriff, eine Zahl. | Konkretheit ist das Gegenteil von Slop. |
| T4 | **Überschriften sagen etwas**. Navigation bleibt schlicht und findbar („Speisekarte“, „Reservieren“), Abschnittsüberschriften sind konkret, wenn das Briefing es trägt. | Wiederkehrende Standard-H2 („Was Gäste sagen“) auf 24 von 36 v2-Seiten. |
| T5 | **Sprache**: Deutsch, „Sie“ als Standard (abweichend nur per Creative Direction), Zahlen als Ziffern, Uhrzeiten 24-h („17:30 Uhr“), Preise „11,50 €“, Halbgeviertstrich mit Leerzeichen („ – “), höchstens ein Ausrufezeichen je Seite, keine englischen Füllwörter. | Deutsche Typografie; Ton eines Hauses, nicht einer Agentur. |
| T6 | **KI schreibt Vorschläge, keine Tatsachen.** Jede KI-Ausgabe hat Status `vorschlag` und durchläuft danach alle Regeln erneut. | Das Modell ist Zulieferer, nicht Schiedsrichter. |

### Prozess

| # | Regel | Grund |
|---|---|---|
| P1 | **Tauschprobe**: Tauscht man Name, Karte und Fotos zweier Häuser und beide Seiten bleiben gleich plausibel, ist die Komposition nicht spezifisch genug. | Einziger Test, der Austauschbarkeit direkt misst. |
| P2 | **Messwerte sichern Untergrenzen, kein Qualitätsurteil.** Kontrast, Touch-Ziele, Performance und Copy-Regeln werden automatisch geprüft; ob eine Seite gut ist, entscheidet ein Review. Keine Punktzahl als Qualitätsbeleg. | v2-Judge vergab 10/10 an austauschbare Seiten. |
| P3 | **Pilot-Inhalte nie auf andere Häuser übertragen** – weder Leitidee noch Signatur noch Texte. Muster werden erst ins System aufgenommen, wenn mehrere echte Briefings sie belegen. | Sonst entsteht die nächste Template-Lotterie. |

## 4. Typografie

**Kundenseiten**
- Höchstens zwei Familien (Anzeige + Text); eine dritte nur als Akzent, wenn die Creative Direction sie begründet.
- Schriften selbst hosten (WOFF2, Subsets latin + latin-ext), nie von Drittservern laden. Lizenz
  (meist SIL OFL) und Quelle je Schrift im Schriftregister dokumentieren.
- `font-display: swap` mit metrisch angepasster Fallback-Schrift, damit der Wechsel kein Layout
  verschiebt (CLS).
- Fließtext mobil mindestens 17 px, Zeilenhöhe ≥ 1,45, Zeilenlänge 45–75 Zeichen. Keine Schrift unter 12 px.
- Hierarchie über Größe, Gewicht und Raum – nicht über Farbe.
- Versalien nur für kurze Labels (≤ 3 Wörter) mit angepasster Laufweite, nie für Sätze.
- Preise und Zeiten mit Tabellenziffern (`font-variant-numeric: tabular-nums`).
- `lang="de"` und `hyphens: auto` für Fließtext; Überschriften nicht trennen.
- Jede Schrift erfüllt eine Rolle aus der Creative Direction („Name im Vorhang, Preise auf den
  Zetteln“), nicht nur „H1/H2/Body“.

**Studio**
- System-Schriften (Sans und Mono, Abschnitt 9). Begründung: [`docs/decisions/0007-studio-ui-typografie.md`](docs/decisions/0007-studio-ui-typografie.md).
- Fließtext 16 px, eine kleine feste Skala (14 · 16 · 20 · 28 · 40 px), Mono für Pfade, IDs und Werte.

## 5. Bildsprache

- **Vorrang**: (1) eigene Fotos des Betriebs mit Freigabe → (2) beauftragte Fotos → (3) KI-Bilder nur für
  Stimmung/Textur, intern gekennzeichnet, nie als Gericht, Raum, Team oder Haus ausgegeben →
  (4) gesichteter Stock nur für Stimmung → (5) kein Bild: dann trägt die Typografie. Lieber bildarm als
  unglaubwürdig.
- **Bildplan je Bildplatz**: Motiv, Rolle (Beweis/Stimmung/Orientierung), Zuschnitt desktop und mobil,
  Fokuspunkt, Alt-Text, Herkunft, Rechte, Freigabe. Ein Bildplatz ohne passendes Bild bleibt leer und
  wird gemeldet.
- **Art Direction statt Zuschneiden**: eigener mobiler Ausschnitt (oder eigenes Motiv), nie nur
  `object-position: center`.
- **Technik**: feste Maße gegen Layoutsprünge, moderne Formate (AVIF/WebP), nur das Hero-/LCP-Bild
  priorisiert, alle anderen lazy. Bilder in Produktion selbst gehostet, keine Hotlinks.
- **Alt-Text** beschreibt, was man sieht und warum es da ist („Lucia faltet Tortellini am Pastabrett“),
  nicht „Bild von …“. Dekorative Bilder `alt=""`.
- Keine echten Personen, Räume oder Gerichte des Betriebs per KI erzeugen.

## 6. Layout

- **Mobile first**: Entwurf beginnt bei 360–390 px. Breakpoints richten sich nach dem Inhalt, geprüft
  werden mindestens 360, 390, 768, 1280 und 1440 px.
- **Raster**: Abstände auf einem 8-px-Raster, 4 px als einziger Halbschritt. Gilt für Studio und Kundenseiten.
- **Dramaturgie aus der Creative Direction**: Jeder Abschnitt hat einen Grund („warum hier?“) und ein
  Gewicht (groß/normal/klein). Die Reihenfolge folgt Hauptaktion und Briefing, nicht einem Archetyp.
- **Erster Bildschirm** (390 × 844): Name, was und wo, die Hauptaktion (reservieren, bestellen, anrufen
  oder informieren) – ohne Scrollen.
- **Mobile Aktionsleiste** nur, wenn sie im ersten Bildschirm keine Hero-Knöpfe doppelt oder verdeckt.
- **Mobile Navigation** ist Pflicht, sobald es mehr als eine Seite oder mehr als drei Sprungziele gibt.
- **Abschnitte** durch Flächenwechsel und Raum trennen statt durch Linien und Kästen. Begrenzte
  Textbreiten; keine Standard-Dreispalter.
- **Formulare**: sichtbare Beschriftungen (nie nur Platzhalter), Fehler direkt am Feld und für
  Screenreader angesagt (`aria-live`), passende `autocomplete`- und `inputmode`-Werte, so wenige Felder
  wie möglich, deutsche Datums- und Zeitformate.

## 7. Bewegung

Drei Regeln aus v1 bleiben verbindlich:
1. **Nichts springt.** Animiert werden nur `transform` und `opacity`.
2. **Nichts versteckt Inhalt.** Ohne JavaScript ist die volle Seite sichtbar (progressive Verbesserung).
3. **Abschaltbar.** Bei `prefers-reduced-motion: reduce` gibt es keine Bewegung.

Dazu:
- Höchstens **ein Bewegungsmoment** je Seite, und er dient der Geschichte oder der Hauptaktion. Bewegung
  als Dekoration (jede Sektion „fliegt ein“) entfällt.
- UI-Übergänge 150–250 ms, größere Momente bis 400 ms; keine Endlosschleifen im Sichtfeld außer als
  bewusstes Signature-Detail mit Pause-Möglichkeit.
- Kein Scroll-Jacking, keine Parallaxe auf Mobilgeräten, kein Autoplay mit Ton. Video nur aus eigenem
  Material, mit Standbild-Fallback und Pause-Knopf.
- Bewegung darf das Layout nicht verschieben (CLS ≤ 0,1).
- Im Studio bewegt sich nur, was einen Zustand anzeigt (Laden, Speichern, Fehler).
- Umsetzung in der Restaurant-Komposition (ADR 0020): `quiet` ohne Bewegung; `editorial` hebt den Kopf
  des ersten Signature-Abschnitts beim Hineinscrollen an (Scroll-Timeline, Deckkraft nie unter 0,4);
  `expressive` setzt den Namen einmal beim Laden (nur Verschiebung, nie unsichtbar).
- Ausnahme mit eigenem Profil: das Basissystem narrative-editorial (§12, ADR 0022) erlaubt sechs
  benannte, scroll-gebundene Effekte mit festen Obergrenzen – nie zeitgesteuert, nie in Schleife.

## 8. Mobile, Barrierefreiheit, Performance, SEO

- **Barrierefreiheit**: WCAG 2.2 AA ist die Untergrenze. Text-Kontrast ≥ 4,5 : 1 (große Schrift und
  Bedienelement-Grenzen ≥ 3 : 1), sichtbarer Fokus, vollständige Tastaturbedienung, semantische
  Landmarken, Überschriften in Reihenfolge, Sprunglink zum Inhalt, Information nie nur über Farbe.
- **Touch-Ziele** mindestens 44 × 44 px.
- **Performance-Budget Kundenseiten** (75. Perzentil, mobil): LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1.
  Client-JavaScript nur für Interaktion; Server Components sind Standard.
- **Mobile Pflichten**: Telefon als `tel:`-Link, Adresse mit Routenlink, Öffnungszeiten als Text,
  Speisekarte als HTML statt PDF (ein PDF des Betriebs ist Quelle, nicht Ausgabe). WhatsApp nur als
  Link und nur, wenn der Betrieb den Kanal aktiv betreut; vorhandene Buchungssysteme (Resmio,
  OpenTable, Quandoo …) als Link statt eingebettetem Fremdskript.
- **SEO**: semantisches HTML, Metadaten je Seite, `Restaurant`/`LocalBusiness`-JSON-LD nur aus
  bestätigten Angaben, Canonical-URL, Sitemap. Entwürfe und Vorschauen tragen `noindex`.

## 9. Studio-Token-Set (funktionale UI)

Definiert in `src/app/globals.css`, als Tailwind-Tokens nutzbar (`bg-paper`, `text-ink`, …). Die
Kontraste prüft `src/app/studio-tokens.test.ts` bei jedem `npm test`.

| Token | Hell | Dunkel | Aufgabe |
|---|---|---|---|
| `paper` | `#f5f3ee` | `#151513` | Seitengrund |
| `surface` | `#fcfbf8` | `#1e1d1a` | Erhöhte Fläche (Tabellen, Formulare) |
| `ink` | `#1b1a17` | `#ece8df` | Text (≥ 7 : 1) |
| `ink-muted` | `#5a564e` | `#aaa498` | Nebentext (≥ 4,5 : 1) |
| `line` | `#dcd6ca` | `#34322d` | Dekorative Haarlinie – trägt nie allein Information |
| `line-strong` | `#857e71` | `#7d776b` | Grenzen von Bedienelementen (≥ 3 : 1) |
| `accent` | `#2b5a4b` | `#93c8b4` | Handlung: Links, Primärknopf, Fokus (≥ 4,5 : 1) |
| `on-accent` | `#ffffff` | `#10201a` | Schrift auf Akzentfläche |
| `ok` | `#2d6a3e` | `#8fce9c` | Zustand „in Ordnung“ – immer mit Text |
| `fail` | `#a3321f` | `#f0a08c` | Zustand „Fehler“ – immer mit Text |

Warmes Papier statt reinem Weiß, Tinte statt Schwarz, ein gedecktes Grün als einziger Handlungsakzent –
bewusst weit weg von Standard-Blau und Lila. Das Studio soll wie ein Arbeitsplatz wirken, nicht wie ein
Produktlaunch.

## 10. Design Directions und Creative Direction

Gestaltung entsteht auf zwei Ebenen. Beide sind nötig; keine ersetzt die andere.

| | **Design Direction** | **Creative Direction** |
|---|---|---|
| Was | Wiederverwendbare Stilrichtung: Stimmung, Schriftpaar, Palette mit Rollen, Layout-Vokabular (Hero, Speisekarte, Galerie), Bewegungsintensität | Entscheidung für genau ein Haus: Leitidee, Metapher, Dramaturgie mit „warum“, Signature-Details mit Beleg, bewusster Verzicht |
| Beispiel | „warmes italienisches Quartiersrestaurant“ | „Die Seite ist die Karte auf dem Tisch – mit eingelegter Tageskarte“ |
| Quelle | Studio, belegt durch mindestens eine reale Restaurant-Website und eine Design-Referenz (was übernommen, was bewusst nicht) | Briefing des Betriebs |
| Wiederverwendbar | ja, als Startpunkt für mehrere Häuser | nie (Regel P3) |
| Ort im Code | `src/domain/design` (ROADMAP Stufe 3) | Daten je Website-Projekt + `src/compositions` |

Ein bayerisches Wirtshaus, ein Sushi-Restaurant und ein urbanes Café nutzen dieselbe technische Basis,
aber verschiedene Directions. Zwei Häuser mit derselben Design Direction unterscheiden sich über ihre
Creative Direction – die Tauschprobe (P1) muss trotzdem bestehen.

**Entwurf des Schemas** (wird in Stufe 3 als Zod-Schema festgelegt; Ausgangspunkt ist der Typ aus dem
Produktplan, ergänzt um die Regeln dieses Dokuments):

```ts
type DesignDirection = {
  id: string;
  mood: string; // ein Satz, keine Adjektivkette (T2)
  references: { url: string; kind: "restaurant" | "design"; adopted: string[]; rejected: string[] }[];
  typography: {
    displayFont: FontId; // aus dem Schriftregister: selbst gehostet, Lizenz belegt, nicht auf der S1-Liste
    bodyFont: FontId;
    scale: "editorial" | "compact" | "monumental";
  };
  palette: {
    // jede Rolle mit Aufgabe; Kontraste werden geprüft (Abschnitt 8)
    background: string; surface: string; text: string; textMuted: string;
    primary: string; onPrimary: string; accent: string; lineStrong: string;
  };
  layout: {
    hero: "cinematic" | "split-editorial" | "immersive-type" | "gallery";
    menu: "typographic" | "card-minimal" | "course-led";
    gallery: "full-bleed" | "masonry" | "horizontal-scroll" | "none";
  };
  motion: { intensity: "quiet" | "expressive" | "editorial" }; // Abschnitt 7 gilt immer
};
```

Leitplanken:
- Die Layout-Werte sind **Vokabular, keine Vorlagen**. Welcher Wert gilt, begründet die Creative
  Direction; eine Komposition darf eigene Abschnitte bauen, die in keinem Wert vorkommen.
- `hero: "cinematic"` nur mit eigenem Foto- oder Videomaterial (S10, ADR 0014); ohne Material trägt
  die Typografie (`immersive-type`).
- `gallery: "none"` ist eine gültige Wahl – lieber keine Galerie als Stock.
- Eine Direction ohne belegte Referenzen wird nicht verwendet (Abschnitt 1).

## 11. Restaurant-Komposition (Stufe 4)

Die erste Komposition (`src/compositions/restaurant/`, ADR 0020) setzt die Directions so um:

- **Hero ohne Foto:** Der Name ist das Bild. *split* stellt neben den Namen eine Tafel mit dem, was
  heute gilt (Tageskarte, sonst Öffnungszeiten); *immersive* setzt den Namen als Plakat auf zwei
  ausgewogene Zeilen, gedeckelt über Breite **und** Fensterhöhe – Einleitung und Handlung bleiben auf
  dem ersten Bildschirm.
- **Dramaturgie statt Vorlage:** Reihenfolge, Gewicht und Überschriften kommen aus der Creative
  Direction; kein Haus hat dieselbe Abschnittsfolge wie ein anderes (Test).
- **Speisekarte** in drei Satzarten: Punktlinie bis zum Preis (typografisch), Zettel mit Preis
  (Karten), Gänge mit großer Ziffer in der Signalfarbe (Kochbuch). Preise in Tabellenziffern,
  Allergene klein, aber vollständig.
- **Bildplätze** sind schraffierte Rahmen mit Motiv und Grund („Foto folgt · Noch kein Foto“) – eine
  Foto-Aufgabe für den Betrieb, nie ein Stockfoto.
- **Mobile:** Menü als `<details>` (ohne JavaScript bedienbar), unten eine klebende Leiste mit der
  Hauptaktion und Anruf/Route; Tippziele ≥ 44 px (E2E).
- **Ehrliche Demos:** Pflichthinweis oben und im Fuß, gesperrte Formulare mit Begründung, in
  Beispielen keine wählbaren Nummern.

## 12. Basissystem narrative-editorial (ADR 0022)

Qualitätsmaßstab ist eine atmosphärische Restaurant-Website; übernommen werden nur abstrakte
Prinzipien ([`docs/design-studies/dishoom-analysis.md`](docs/design-studies/dishoom-analysis.md)).

| Prinzip | Umsetzung im System |
|---|---|
| Akte statt Abschnitte | Jeder Abschnitt gehört zu `night` oder `paper`; ein Aktwechsel bekommt den großen Abstand `act` |
| Eine Behauptung im Eingang | Hero: Name, ein Satz (`conceptShort`), zwei Wege; die Hausbehauptung (`usp`) öffnet den hellen Akt |
| Erzählung vor Karte | Standardsequenz: Eingang → Behauptung → Geschichte → Handwerk → Karte → Raum → Anfrage → Anfahrt → Abschluss |
| Bilder sind Belege | Bildplätze aus dem Theme, Briefing mit Zweck, Licht, Farbwelt und Alt-Text-Absicht; ohne Foto sichtbar als Aufgabe |
| Zwei Tonlagen, eine Stimme | Schriftrollen Titel, Text, Label, Bildunterschrift – höchstens drei Familien, echte Kursive |
| Ein primärer Weg | Überall gleich benannt und mit gleichem Ziel: Eingang, Kopf, mobiles Menü, Leiste, Abschluss (Test) |
| Ruhige Bewegung mit Zweck | sechs benannte Effekte, alle scroll-gebunden, bei `reduce` aus (Test, E2E) |
| Mobil zuerst | beide Wege auf dem ersten Bildschirm, Menü als `<details>`, Kategorien und Galerie wischbar und per Tastatur, Leiste erst nach dem Eingang |

**Nicht übernommen** (vollständig in der Studie, §11): Name, Texte, Bilder, Farben, Schriften der
Referenz; gesperrte Kapitälchen-Titel, gerahmte Archivfotos mit gedrehter Bildunterschrift,
Ornament-Trenner, Etikett-Karten mit Pfeil, Standortliste über Foto, eingebettete Buchung.

Erstes Küchen-Theme: `indian-bombay-story` – Hausküche und Stadt, gemalte Ladenschrift, Sandstein,
Messing, Zinnober, Regenabend-Indigo; Klischees stehen in den Ausschlüssen der Bildsprache.
