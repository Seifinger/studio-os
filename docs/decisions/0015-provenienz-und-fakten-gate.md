# 0015 – Provenienzmodell und Fakten-Gate

- **Status:** angenommen
- **Datum:** 2026-09-23
- **Bezug:** `src/domain/provenance/`; ARCHITECTURE.md §4.2; MIGRATION.md B2, K1; Quellen:
  `gastro-webagentur/v2/briefing/briefing.js` (`istTatsache`, `istZeigbar`, `pruefeBriefing`) und
  `gastro-v3/src/briefing/validator.js`, `src/blueprints/_shared/util.js` (`confirmed()`) – je @Stand MIGRATION.md

## Kontext

Beide Referenzen haben unabhängig ein Provenienzmodell gebaut, mit verschiedenen Status (MIGRATION.md
B2). Dazu braucht der Vertrieb drei Arten von Seiten: fiktive Beispielbetriebe je Küche,
personalisierte Demos für echte Leads und Kundenseiten (ADR 0016). Dieselbe Angabe muss je nach
Seitenart anders behandelt werden.

## Entscheidung

**Angabe (`Fact<T>`):** fünf Status.

| Status | Pflichtfelder | Bedeutung |
|---|---|---|
| `bestaetigt` | Wert, Quelle, Datum | vom Betrieb bestätigt |
| `uebernommen` | Wert, Quelle, Datum | aus einer unabhängigen, speicherbaren Quelle |
| `vorschlag` | Wert, `by: studio \| ki` | Vorschlag, noch nicht bestätigt |
| `unbekannt` | – (Wert `null`) | liegt nicht vor; fehlende Felder werden automatisch `unbekannt` |
| `fiktiv` | Wert | erfunden – nur für Beispielbetriebe (neu gegenüber v2, dort ein Flag am Briefing) |

- Ein leerer Wert (leerer Text, leere Liste) ist nie eine Angabe (Regel aus v3).
- **Quellarten:** `business`, `businessWebsite`, `onSite`, `publicRegister`, `studioResearch`. Google
  Places ist als Quellart nicht vorgesehen, Google-Links als Quell-URL werden abgelehnt (ADR 0013).
- Profile sind `strictObject`s: Ein Tippfehler im Feldnamen ist ein Fehler, kein stilles „unbekannt“
  (Regel aus v2 `pruefeBriefing`).

**Fakten-Gate (`gate(fact, context)`):**

| Status ↓ / Seite → | `showcase` | `leadDemo` | `customer` Vorschau | `customer` live |
|---|---|---|---|---|
| `bestaetigt`, `uebernommen` | Verstoß | Wert | Wert | Wert |
| `vorschlag` | Entwurf | Entwurf | Entwurf | **Verstoß** |
| `unbekannt` | weglassen | Platzhalter | Platzhalter | weglassen |
| `fiktiv` | Wert | **Verstoß** | **Verstoß** | **Verstoß** |

Ein Verstoß bricht den Build ab. `auditFacts` prüft ein ganzes Profil; `pagePolicy` liefert je
Seitenart `noindex`, „nicht gelistet“ und den Pflichthinweis („Beispielseite …“, „Konzeptentwurf …
nicht die offizielle Website von …“, „Vorschau …“).

**Sprache der Werte (präzisiert ADR 0008):** Werte, die im Gespräch mit Betrieben oder Gästen
vorkommen, bleiben deutsch (Status, Küchen, Kennzeichnungen, Allergene). Technische Schlüssel sind
englisch (Feldnamen, Quellarten, Aktionstypen, Preisstufen).

## Betrachtete Alternativen

- **v3-Modell mit drei Status:** `draft` vermischt „Vorschlag“ und „fehlt“; genau diese Unterscheidung
  braucht die Lead-Demo (Entwurf vs. Platzhalter).
- **Fiktion als Flag am Betrieb (v2):** Ein Flag kann eine einzelne erfundene Angabe in einem echten
  Profil nicht verhindern; der Status pro Angabe kann es.

## Konsequenzen

- Kompositionen (ab Stufe 4) lesen Angaben ausschließlich über `gate`.
- Veröffentlichung einer Kundenseite setzt voraus: keine Verstöße, `publicationApproved` bestätigt.
