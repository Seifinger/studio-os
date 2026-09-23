# 0016 – Demo-Arten und Veröffentlichung über GitHub

- **Status:** angenommen für Teil 1–3 und 5; **Teil 4 offen** (Entscheidung des Inhabers nötig)
- **Datum:** 2026-09-23
- **Bezug:** ergänzt ADR 0014; ROADMAP Stufen 4 und 6; `src/domain/provenance/gate.ts` (`pagePolicy`)

## Kontext

Es gibt noch keinen echten Kunden. Der Vertrieb braucht (a) fiktive, generalistische Demos für die
verschiedenen Küchen und (b) eine halbwegs personalisierte Demo für jeden angefragten Google-Lead.
Veröffentlicht werden soll zunächst über GitHub. Geprüft am 2026-09-23 in der GitHub-Dokumentation:

- Mit GitHub Free muss das Repository einer Pages-Seite öffentlich sein.
- Pages-Seiten sind immer öffentlich im Internet, auch wenn das Repository privat ist.
- Pages ist nicht als kostenloses Hosting für ein Online-Geschäft oder Seiten gedacht, die vor allem
  kommerzielle Transaktionen ermöglichen. Grenzen u. a.: 1 GB je Seite, weiche 100 GB Traffic/Monat,
  weiche 10 Builds/Stunde.

`studio-os` ist privat.

## Entscheidung

1. **Showcase-Demos** (`showcase`): ein fiktiver Beispielbetrieb je Küche, alle Angaben `fiktiv`,
   Hinweis „Beispielseite des Studios – dieser Betrieb ist frei erfunden“, `noindex`. Dürfen öffentlich
   sein und in einer Übersicht stehen.
2. **Lead-Demos** (`leadDemo`): personalisiert über Name, Ort, Küche (als Vorschlag) und Design
   Direction. Alles andere erscheint als erkennbarer Platzhalter. Name und Ort brauchen eine
   speicherbare Quelle (Website des Betriebs, Impressum, Schild vor Ort) – aus Google kopierte
   Angaben sind nicht zulässig (ADR 0013). Formulare sind in Demos sichtbar, verschicken aber nichts.
   Hinweis „Konzeptentwurf … nicht die offizielle Website von …“, `noindex`, nicht gelistet.
3. **Veröffentlichung über GitHub Pages** als statischer Export der Demo-Seiten (Stufe 4), getrennt
   vom Laufzeitsystem. In das Pages-Ziel gelangt nur die gebaute Ausgabe – kein Quellcode, keine
   Profile, keine internen Notizen.
4. **Offen – wo Lead-Demos liegen.** Weil Pages mit GitHub Free ein öffentliches Repository braucht,
   wären Lead-Demos dort samt Dateinamen öffentlich einsehbar. Das widerspricht „nicht gelistet“ aus
   ADR 0014. Optionen:
   - **A – GitHub Pro für studio-os** (kostenpflichtig): Pages aus dem privaten Repository; die Seiten
     sind öffentlich erreichbar, aber ihre Pfade nirgends aufgelistet (nicht erratbarer Token).
   - **B – Showcases öffentlich, Lead-Demos nicht gehostet:** Lead-Demos als lokale Datei bzw. auf
     dem eigenen Gerät beim Termin zeigen; kein Link per Mail.
   - **C – ein öffentliches Demo-Repository für beides:** kostenlos, aber echte Betriebsnamen stehen
     öffentlich in der Dateiliste. Nicht empfohlen.
   Empfehlung: B sofort, A sobald Links verschickt werden sollen.
5. **Kundenseiten gehen nicht über GitHub Pages live** (Nutzungsbedingungen); dafür bleibt Stufe 6
   (Vercel oder ein anderer kommerziell zulässiger Host).

## Konsequenzen

- Stufe 4 baut zwei Demo-Arten aus derselben Kompositionslogik; Unterschiede stecken nur im
  Fakten-Gate und in `pagePolicy`.
- Für Lead-Demos gehört zum Import eines Leads ein kurzer Schritt „Name und Ort aus eigener Quelle
  bestätigen“ (automatisierbar über den `<title>` der eigenen Website des Betriebs, Stufe 8).
