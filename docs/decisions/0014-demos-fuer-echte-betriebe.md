# 0014 – Konzept-Demos für echte Betriebe

- **Status:** angenommen
- **Datum:** 2026-09-23
- **Bezug:** ROADMAP.md Stufen 4 und 8; DESIGN.md §3 (T1); MIGRATION.md B16, B17; Produktprinzip 5

## Kontext

Der Vertriebsweg lebt von Demos: eine Konzeptseite für ein bestimmtes Restaurant, vor Ort auf dem
Handy gezeigt oder als Link. v1 hat solche Entwürfe mit Katalog-Speisekarten öffentlich auf GitHub
Pages gestellt; v3 erzeugt generische Demos mit fremdem Video. Beides widerspricht den
Produktprinzipien (keine erfundenen Fakten) und ist rechtlich heikel (Name und Marke eines Dritten
öffentlich, unaufgeforderte Werbung).

## Entscheidung

Eine Demo ist ein Website-Projekt mit Status `demo` und folgenden Pflichten:

1. **Nicht öffentlich:** Vorschau-URL mit nicht erratbarem Token, `noindex, nofollow`, keine
   Auflistung auf einer öffentlichen Übersicht, Ablaufdatum.
2. **Sichtbar gekennzeichnet:** „Konzeptentwurf von [Studio] – nicht die offizielle Website von …“.
3. **Keine erfundenen Fakten:** Fehlende Inhalte erscheinen als erkennbare Platzhalter
   („Hier steht Ihre Mittagskarte“), nie als Katalog-Gerichte, Preise, Zeiten oder Stimmen.
   Gezeigt wird die *Gestaltungsidee* – Typografie, Rhythmus, Bildführung –, nicht ein gefälschtes Haus.
4. **Keine Google-Inhalte gespeichert** (ADR 0013); keine Google-Fotos oder Rezensionen.
5. **Medien nur mit Rechten:** eigenes Stimmungsmaterial des Studios oder lizenziertes Material,
   intern gekennzeichnet; keine Stockfotos als „Ihr Haus“.
6. **Kontaktweg:** persönlich vor Ort oder auf ausdrückliche Anfrage; kein Massenversand (§ 7 UWG).
7. Mit Beauftragung wird aus der Demo ein Briefing; Platzhalter werden durch bestätigte Angaben ersetzt.

## Betrachtete Alternativen

- **Öffentliche Showcase-Seite mit echten Namen (v1):** größte Reichweite, aber Namens-/Markenrecht und
  Verwechslungsgefahr.
- **Demos nur mit fiktiven Betrieben:** rechtlich am sichersten, im persönlichen Gespräch aber weniger
  überzeugend. Bleibt für öffentliche Referenzen die Regel.

## Konsequenzen

- Stufe 4 braucht einen Demo-Modus (Token, Kennzeichnung, Platzhalter) als Teil der Komposition.
- Ohne echte Inhalte muss die Gestaltung selbst überzeugen – das stützt DESIGN.md §1.
