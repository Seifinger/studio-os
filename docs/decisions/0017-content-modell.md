# 0017 – Content-Modell: Profil, Öffnungszeiten, Preise, Speisekarte, Aktionen, Küchen

- **Status:** angenommen
- **Datum:** 2026-09-23
- **Bezug:** `src/domain/content/`, `src/domain/gastronomy/`, `src/domain/briefing/`, `src/domain/hash/`;
  MIGRATION.md K2, K16; Quellen: `gastro-webagentur/v2/briefing/briefing.js` (`FELDER`),
  `src/menuCatalog.js` + `test/menuCatalog.test.js` (`detectCuisine`), `gastro-v3/src/composer/index.js` (`seedHash`)

## Entscheidung

- **Betriebsprofil** branchenneutral (22 Felder), **Restaurantprofil** ergänzt Küche, Speisekarte,
  Signaturgerichte, Besonderheiten. Jedes Feld ist eine Angabe mit Herkunft (ADR 0015). Marke, Medien
  und Stil folgen in Stufe 3.
- **Fragenkatalog:** zu jedem Profilfeld genau eine Frage in Sie-Form (aus v2 überarbeitet); ein Test
  hält Katalog und Profil deckungsgleich. `openQuestions` liefert, was im nächsten Gespräch offen ist.
- **Telefon:** gespeichert als E.164 plus Anzeigeform; ohne Landesvorwahl gilt +49; Nummern ohne
  Vorwahl werden abgelehnt statt geraten; „(0)“ wird entfernt.
- **Preise in ganzen Cent** (v1 speicherte Kommazahlen), Anzeige über `Intl` (de-DE).
- **Öffnungszeiten** als Wochenplan; Zeiträume über Mitternacht erlaubt; Überschneidungen werden
  innerhalb eines Tages *und* über die Tagesgrenze (inkl. So → Mo) erkannt; Kurzform fasst gleiche
  Folgetage zusammen („Mi–Fr 11:30–14:00, 17:30–22:00“).
- **Speisekarte** mit den 14 LMIV-Hauptallergenen (ohne hauseigene Kennbuchstaben) und
  Widerspruchsprüfung (vegan + Milch, vegetarisch + Fisch).
- **Aktionen:** `call`, `whatsapp`, `tableRequest`, `pickupRequest`, `onlineBooking`, `menu`,
  `directions`. Verfügbar nur, wenn die Angabe dahinter das Gate passiert. Beschriftung ehrlich:
  „Tisch anfragen“ statt „Tisch reservieren“, solange keine Buchung dahintersteht. Anfrageformulare sind
  in Demos sichtbar, aber `demoOnly`. Buchungslinks bekannter Anbieter müssen auf deren Domain zeigen.
- **Adressen** vorerst nur deutsch (fünfstellige PLZ) – bewusst, bis ein Kunde im Ausland kommt.
- **Küchen-Vorschlag aus dem Namen** (neuer Kandidat K20): neu geschrieben nach v1 `detectCuisine`,
  mit den v1-Testfällen als Spezifikation, aber
  - Treffer nur am Wortanfang, riskante Kurzwörter nur als ganzes Wort (v1 traf „Romantik“ als
    italienisch, „Bowling“ als asiatisch, „Currywurst“ als indisch, „Zum Drachen“ als chinesisch);
  - kein Standardwert: ohne Treffer „unbekannt“ statt „bayerisch“;
  - Ergebnis immer Status `vorschlag` mit Begründung („Name enthält „pizz““).
  Bewusst verloren: v1 erkannte „Klabwong“ über „wong“ mitten im Wort als thailändisch.
- **Stabiler Hash:** FNV-1a über UTF-8 (statt djb2 über UTF-16) – mit offiziellen Testwerten prüfbar.

## Konsequenzen

- Stufe 4 kann Showcase- und Lead-Demos allein aus Profilen komponieren.
- Stufe 5 nutzt `requestChannels` + `email` für den Conversion-Layer.
