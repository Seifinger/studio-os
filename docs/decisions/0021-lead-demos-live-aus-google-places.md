# 0021 – Lead-Demos live aus Google Places, nur lokal

- **Status:** angenommen
- **Datum:** 2026-09-23
- **Bezug:** ändert ADR 0016 Teil 2 und entscheidet Teil 4 (Option B); ADR 0013, 0014, 0015;
  `src/server/integrations/google-places.ts`, `src/domain/leads/`, `src/server/leads/`,
  `src/catalog/lead-demos.ts`, `src/app/demo/`; Referenz: gastro-webagentur `src/placesClient.js`
  und gastro-v3 `dashboard/prospect-server.js` (@bd23138 bzw. @ddcad23)

## Kontext

Der Inhaber möchte für jeden angefragten Lead eine halbwegs personalisierte Demo und verweist auf
gastro-webagentur, das die Angaben automatisch aus Google Places gezogen hat. Beide Referenzen fragen
dieselben sieben Felder ab: ID, Name, Adresse, Telefon, Website, Bewertung, Anzahl Bewertungen.
ADR 0013 erlaubt Places-Inhalte nur live und mit Quellenangabe, gespeichert wird nur die Place-ID.
Für den Ort der Lead-Demos hat der Inhaber Option B gewählt: nur lokal auf dem eigenen Gerät.

## Entscheidung

1. **Live statt Kopie.** `/demo/[placeId]` ruft bei jedem Aufruf Place Details ab (`cache:
   "no-store"`, keine Zwischenspeicherung) und baut daraus ein Profil im Speicher. Direkt
   übernommene Angaben (Name, Ort, Adresse, Telefon, Öffnungszeiten) tragen den Status `uebernommen`
   mit der Quelle `googlePlacesLive` – eine Quellart, die das Speicherschema nicht kennt. Abgeleitetes
   (Küche aus Name oder Google-Typ) ist `vorschlag` und als Entwurf markiert. Alles andere bleibt
   Platzhalter mit der Frage fürs Gespräch.
2. **Field Mask `leadDemo`**: die Datenlage der Referenzen, ergänzt um Öffnungszeiten, strukturierte
   Adresse, Typ und Status – alles in der Enterprise-Stufe wie die Lead-Suche, ohne Atmosphere-Felder,
   ohne Fotos, Rezensionen und Zusammenfassungen (Test).
3. **Nur lokal.** Die Route antwortet nur mit `STUDIO_LEAD_DEMOS=local` **und** einem Aufruf über
   localhost; sonst 404 bzw. ein Hinweis. Sie ist nie Teil des statischen Exports.
4. **Quellenangabe:** Fußzeile „Einzelne Angaben: Google Maps – beim Aufruf abgerufen, nicht
   gespeichert.“; die Bewertung steht als „x,x von 5 · n Bewertungen auf Google Maps“. Ob Google für
   diese Nutzung das Logo verlangt, ist vor dem ersten Einsatz im Kundentermin zu prüfen.
5. **Keine Demo** für dauerhaft geschlossene Betriebe; unbekannte Place-IDs ergeben 404.
6. **Design Direction** nach vorgeschlagener Küche, sonst das Bistro-System; die Dramaturgie ist
   neutral (`leadCreativeDirection`) und ausdrücklich kein Ersatz für eine Creative Direction.

## Betrachtete Alternativen

- **Angaben aus eigener Quelle bestätigen lassen (ADR 0016 Teil 2):** sauberer für veröffentlichte
  Demos, aber für eine lokale Gesprächsgrundlage zu viel Handarbeit; bleibt Pflicht, sobald eine
  Demo verschickt oder gehostet wird.
- **Textsuche statt Place Details:** liefert keine Öffnungszeiten in derselben Anfrage; die Place-ID
  kommt ohnehin aus der Recherche (gastro-v3).
- **Zwischenspeichern der Antwort:** spart Kosten, verstößt aber gegen die Places-Bedingungen.

## Konsequenzen

- Jeder Aufruf kostet eine Enterprise-Anfrage – Budget-Alarm in der Google Cloud setzen.
- Sollen Lead-Demos später verschickt werden (Option A aus ADR 0016), braucht es bestätigte Angaben
  aus eigener Quelle und einen privaten Host; die Live-Route bleibt dann Werkzeug im Termin.
