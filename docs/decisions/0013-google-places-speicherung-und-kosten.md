# 0013 – Google Places: nur Place-IDs speichern, Felder bewusst wählen

- **Status:** angenommen (präzisiert ARCHITECTURE.md §5 der Foundation)
- **Datum:** 2026-09-23
- **Bezug:** `src/server/integrations/places-fields.ts`, `ports.ts`; MIGRATION.md B9, K5; Produktprinzip 8

## Kontext

Die Foundation erlaubte „andere Places-Inhalte mit Ablaufdatum ≤ 30 Tage“. Die aktuelle
Google-Policy für die Places API (New) ist strenger (abgerufen am 2026-09-23 von
developers.google.com/maps/documentation/places/web-service/policies):

- Place-IDs sind von den Caching-Einschränkungen ausgenommen und dürfen unbegrenzt gespeichert werden.
- Andere Places-Inhalte dürfen nicht vorab abgerufen, gecacht oder gespeichert werden, außer im Rahmen
  der ausdrücklichen Ausnahmen.
- Werden Places-Daten ohne Google-Karte angezeigt, ist das Google-Logo nach den Stilvorgaben Pflicht;
  bei Fotos und Rezensionen zusätzlich die Autorennennung.

Die Kosten hängen an der Field Mask (Text Search (New), gleiche Quelle, Seite „Text Search“):
`places.id` → *Essentials (IDs Only)*; `displayName`, `formattedAddress`, `businessStatus`,
`googleMapsUri` → *Pro*; `websiteUri`, `nationalPhoneNumber`, `rating`, `userRatingCount`,
Öffnungszeiten → *Enterprise*; Rezensionen u. a. → *Enterprise + Atmosphere*. `places.photos`
gehört zur Pro-Stufe – deshalb reicht „Pro“ allein nicht als Datenschutzregel.

## Entscheidung

1. **Gespeichert wird:** die Place-ID, die eigene Website-Analyse, eigene Notizen und Angaben, die
   das Studio *unabhängig* erhoben hat (Website des Betriebs, Gespräch, Aushang) – jeweils mit Quelle.
2. **Nicht gespeichert wird:** jeder andere Places-Inhalt (Name, Adresse, Telefon, Website, Bewertung,
   Öffnungszeiten). Die Rechercheansicht ruft ihn beim Anzeigen live ab und zeigt das Google-Logo.
3. **Field Masks sind feste, getestete Konstanten je Anwendungsfall** (`places-fields.ts`):
   `leadSearch` (Pro + die für das Scoring nötigen Enterprise-Felder), `researchDisplay` (Pro).
   Keine Maske darf Fotos, Rezensionen oder Zusammenfassungen anfordern; ein Test prüft das.
4. `PlaceCandidate` bekommt keine Felder, die keine Maske anfordert, und dokumentiert die SKU je Feld.

## Betrachtete Alternativen

- **30-Tage-Cache wie in der Foundation:** nicht durch die Policy gedeckt.
- **Nur Pro-Felder für die Suche:** billiger, aber ohne `websiteUri` fällt der stärkste Lead-Befund
  („keine Website“) weg. Deshalb ist Enterprise für die Lead-Suche eine bewusste Kostenentscheidung,
  mit Budget-Alarm in Google Cloud.

## Konsequenzen

- gastro-webagentur (v1) und gastro-v3 speichern mehr (CSV bzw. `prospects.json`) – das wird nicht übernommen (MIGRATION.md B9).
- Eine Lead-Liste zeigt Namen entweder live (kostet je Anzeige) oder aus unabhängig erhobenen
  Angaben. Das entscheidet Stufe 8.
- Vor Stufe 8 werden Policy und Preise erneut geprüft.
