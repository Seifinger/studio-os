# Designstudie: atmosphärische Restaurant-Website (Referenz „Dishoom“)

- **Stand:** 2026-09-23
- **Material:** vier Mobil-Screenshots und eine 25-Sekunden-Mobilaufnahme des Inhabers (lokal unter
  `references/dishoom/`, nicht im Repository)
- **Zweck:** Qualitätsmaßstab für das Basissystem `narrative-editorial-base` (ADR 0022)
- **Grenze:** Diese Studie beschreibt **Muster**, nicht die Seite. Sie ist keine Bauanleitung. Wer
  sie liest, soll verstehen, *warum* die Referenz wirkt – und danach etwas Eigenes bauen.

## 1. Emotionale Dramaturgie

Die Seite erzählt in vier Akten, jeder mit einem eigenen Gefühl:

1. **Ankommen (dunkel, still):** Ein bewegtes, stark abgedunkeltes Bild eines Handgriffs füllt den
   ersten Bildschirm. Darüber steht nur ein kurzer Satz. Das Gefühl ist „Schwelle“: Man betritt
   einen Ort, bevor man Informationen bekommt.
2. **Zuhören (hell, langsam):** Der Hintergrund wechselt hart von dunkel zu warmem Papier. Es folgt
   ein langer Einleitungssatz in großer Schrift, danach Fließtext im Buchsatz. Bilder wirken wie
   Belege aus einem Archiv, jeweils mit Bildunterschrift.
3. **Wählen (hell, geordnet):** Die wichtigsten Wege (Karte, Tisch, Laden) erscheinen als große,
   bildgeführte Einstiege, nicht als Menüpunkte.
4. **Hingehen (wieder dunkel):** Die Standorte stehen als große typografische Liste über einem
   ruhigen Bild, danach geht es in die Karte.

**Abstraktes Prinzip:** Kontrastwechsel markieren den Aktwechsel. Innerhalb eines Aktes bleibt die
Seite ruhig. Emotion entsteht aus der Reihenfolge – erst Ort, dann Geschichte, dann Handlung –
nicht aus Effekten.

## 2. Scroll-Rhythmus (mobil)

- Etwa **ein Gedanke je Bildschirmhöhe**: Satz → Bild → Absatz → Bild → Einstieg. Kaum
  Nebeneinander, fast alles steht untereinander.
- Große Pausen zwischen Akten, kleine innerhalb. Der Weißraum ist Taktgeber, keine Leere.
- Die Bilder sitzen nicht randlos, sondern leicht eingerückt mit eigenem Rahmen. Dadurch lesen sie
  sich als Objekte in einer Erzählung, nicht als Hintergrund.
- Beim Scrollen gibt es nur kleine Bewegungen: Text wird sichtbarer, Einstiegskarten gleiten
  seitlich herein. Es gibt kein Scrolljacking, und das Tempo bestimmt immer die Hand.

## 3. Informationshierarchie

| Ebene | Aufgabe | Beobachtung (abstrakt) |
|---|---|---|
| Marke | Wer ist das? | Wortmarke klein im Kopf, nie im Weg |
| Behauptung | Warum hier? | Ein kurzer Satz im ersten Bildschirm, keine Aufzählung von Vorzügen |
| Erzählung | Was steckt dahinter? | Langer Text, gut gesetzt, mit Belegbildern |
| Handlung | Was kann ich tun? | Zwei gleichwertige Wege im ersten Bildschirm (Karte, Tisch), später große Einstiege |
| Service | Wo, wann, was genau? | Standorte, Karte mit Kategorien, Allergene und Filter als eigene Ebene |

**Prinzip:** Die Handlung ist ab dem ersten Bildschirm erreichbar, bleibt aber optisch *unter* der
Erzählung. Sie drängt sich nicht vor, verschwindet aber auch nie.

## 4. Typografie und Bild

- **Eine Stimme, zwei Tonlagen:** Eine charaktervolle Schrift trägt Behauptungen und Titel, eine
  ruhige Textschrift trägt die Erzählung. Kleine, gesperrte Labels ordnen.
- **Text vor Bild, dann Bild als Beleg:** Der Text behauptet, das Bild beweist. Die
  Bildunterschrift benennt, was zu sehen ist, und wird damit Teil der Geschichte.
- Große Einleitungssätze haben eigene Bildschirmhöhen; Fließtext ist schmal gesetzt.
- Über dunklen Bildern steht Text nur, wo das Bild bewusst ruhig und stark abgedunkelt ist.

**Prinzip:** Typografie ist das Hauptinstrument. Bilder sind knapp, konkret und belegen etwas.

## 5. Mobile Navigation

- Kopfzeile schlank: Menü-Symbol, Wortmarke, wenige Symbole, **ein dauerhafter Buchungs-Knopf**.
- Das Hauptmenü öffnet eine eigene, ruhige Fläche und behält den Weg zurück sichtbar.
- Die Karte ist in Kategorien gegliedert, die sich horizontal wählen lassen; Filter und
  Zusatzinfos sind eigene, klar benannte Schalter.

**Prinzip:** Wenige Wege, immer dieselben, immer an derselben Stelle.

## 6. CTA-Logik

1. **Dauerhaft, aber leise:** Ein kleiner Buchungs-Knopf im Kopf ist von überall erreichbar.
2. **Doppelt im Eingang:** Im ersten Bildschirm stehen zwei gleichwertige Wege (ansehen, buchen).
   Die Nutzerin wählt zwischen Neugier und Absicht.
3. **Kontextuell in der Erzählung:** Nach der Geschichte kommen große, bildgeführte Einstiege statt
   weiterer Knopfreihen.
4. **Buchung als eigener Raum:** Die Buchung öffnet sich als abgesetzte Fläche mit klarem
   Schließen. Bei Kapazitätsgrenzen steht dort ehrlich, wie es sonst geht.

**Prinzip:** Ein primärer Weg (Tisch), ein sekundärer (Karte). Beide stehen konsistent benannt an
vorhersehbaren Orten.

## 7. Wiederkehrende Interaktionsmuster

- Bild + Text-Etikett als Einstieg, das ganze Element ist klickbar.
- Horizontale Kategorienwahl (Karte), unterstrichene aktive Kategorie.
- Überlagerung für Buchung und Menü mit „Schließen“ oben links.
- Liste großer Wörter als Navigation (Standorte).

## 8. Motion-Intensität

**Niedrig bis mittel.** Bewegt sind:
- ein Hintergrundvideo im Eingang,
- ein weicher Wechsel zwischen zwei Eingangssätzen,
- Text, der beim Scrollen an Deckkraft gewinnt,
- seitlich hereingleitende Einstiege,
- eine Kopfzeile, die ihren Grund wechselt.

Nichts springt, nichts blinkt, nichts ist in einer Endlosschleife außer dem Video.

**Für unser System übernommen:** Bewegung nur, wo sie Lesefolge oder Zustand zeigt. Alles bleibt
ohne Bewegung vollständig lesbar.

## 9. Performance-Risiken, die wir vermeiden

| Risiko in der Referenz | Folge | Unsere Regel |
|---|---|---|
| Hintergrundvideo im ersten Bildschirm (mobil) | hoher LCP, Datenvolumen, Akku | Kein Autoplay-Video im Basissystem; Eingang trägt Typografie + optional ein Standbild mit festen Maßen |
| Viele große Fotos mit Rahmen und Überlagerungen | Ladezeit, Layout-Verschiebung | feste Seitenverhältnisse, `loading="lazy"` unterhalb der Falz, nur selbst gehostete Bilder |
| Buchungsfenster eines Drittanbieters | fremde Skripte, Datenschutz, Ladezeit | Anfrage per Formular (Stufe 5) oder Link zum vorhandenen System – nie eingebettet |
| Scroll-gekoppelte Texteffekte in JavaScript | Ruckeln auf schwachen Geräten | nur CSS-Scroll-Timelines, nur `transform`/`opacity`/Maske, ohne Unterstützung statisch |
| Eigene Webfonts in mehreren Schnitten | FOIT/FOUT, Gewicht | höchstens drei Familien, `font-display: swap`, Schnitte aus dem Register |

## 10. Abstrakte Designprinzipien für `narrative-editorial-base`

1. **Akte statt Abschnitte:** Die Seite gliedert sich in wenige Stimmungsräume. Ein Kontrastwechsel
   markiert jeden Wechsel.
2. **Eine Behauptung im Eingang:** Ein Satz, der nur für dieses Haus stimmt, und kein Werbeslogan.
3. **Erzählung vor Karte:** Menschen, Handgriff und Ort kommen zuerst, dann die Speisekarte als Beleg.
4. **Bilder sind Belege:** Jedes Bild hat einen Zweck, ein benanntes Motiv und eine Unterschrift.
   Fehlt das Bild, bleibt die Aufgabe sichtbar.
5. **Zwei Tonlagen, eine Stimme:** eine Titelschrift mit Charakter, eine ruhige Textschrift, kleine
   Labels. Keine vierte Schrift.
6. **Ein primärer Weg:** Tisch anfragen (oder bestellen) ist immer erreichbar und überall gleich
   benannt. Die Karte ist der zweite Weg, und nichts drängt sich dazwischen.
7. **Ruhige Bewegung mit Zweck:** Kopfzeile zeigt den Scrollzustand, Text gewinnt beim Lesen an
   Präsenz, Bilder atmen minimal. Alles ist abschaltbar.
8. **Mobil zuerst gedacht:** ein Gedanke je Bildschirmhöhe, Daumenreichweite für die Hauptaktion,
   keine Hover-Abhängigkeit.
9. **Ehrlichkeit vor Glanz:** Keine erfundenen Belege, keine Stock-Atmosphäre, Grenzen ehrlich benennen
   (z. B. „ohne Reservierung nur Laufkundschaft ab …“).

## 11. Was ausdrücklich NICHT übernommen wird

- Name, Wortmarke, Logo, Texte, Zitate, Claims, Sprachmischungen und Anreden der Referenz.
- Alle Fotos, Videos und Bildmotive der Referenz sowie ihre Bildauswahl und Bildfolge.
- Die konkrete Farbwelt (heller Papierton mit Anthrazit) und alle Farbcodes.
- Die Schriftkombination und die typografische Signatur: gesperrte Kapitälchen-Titel in
  Anführungszeichen, Blocksatz-Erzählung, kursive Untertitel in Einstiegen.
- Gerahmte Fotos mit doppelter Kontur und senkrecht gedrehter Bildunterschrift daneben.
- Ornament-Trenner (Rautenreihe) und doppelte Linien über Labels.
- Bild-Einstiege mit überlappender Etikett-Karte und Pfeil, seitlich versetzt.
- Rechtsbündige Standortliste in großer Schrift über einem Foto.
- Der Kopf mit Wortmarke, drei Symbolen und umrandetem Buchungs-Knopf in dieser Anordnung.
- Die Überlagerung eines fremden Buchungssystems, der Laden, Konto- und Warenkorb-Funktionen.
- Historische, kulturelle oder geografische Behauptungen der Referenz – auch nicht sinngemäß.
- Positionen, Abstände, Proportionen und Komponenten-Kompositionen 1:1 oder erkennbar abgewandelt.

**Gegenprobe vor jeder Abnahme:** Lege die Referenz neben unsere Seite und decke die Logos ab. Wenn
man sie für verwandt hält, ist die Seite nicht fertig.
