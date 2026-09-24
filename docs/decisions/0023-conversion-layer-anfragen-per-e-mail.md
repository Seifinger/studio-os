# 0023 – Conversion-Layer: Anfragen per E-Mail, ohne Datenbank

- **Status:** angenommen
- **Datum:** 2026-09-24
- **Bezug:** ROADMAP Stufe 5; ARCHITECTURE.md §3, §4.3, §5, §6; DESIGN.md §2, §6, §8; ADR 0005 (Ports),
  0009 (Abhängigkeiten), 0014/0016 (Demos verschicken nichts), 0015 (Fakten-Gate), 0020, 0022;
  `src/domain/requests/`, `src/server/requests/`, `src/server/integrations/resend.ts`,
  `src/compositions/shared/`, `src/app/api/anfragen/`, `src/app/anfrage-probe/`.
  Keine Übernahme aus den Referenzen: Die v1/v3-Betriebslogik (K13: Kapazität, Tische, No-Show)
  bleibt bis Stufe 10 Referenz.

## Kontext

Stufe 5 soll das eigentliche Problem kleiner Betriebe lösen: Gäste fragen einen Tisch oder eine
Abholung an, der Betrieb bekommt die Anfrage, der Gast eine Eingangsbestätigung. Ohne Zahlung, ohne
Kapazitätslogik und ohne Datenbank (die kommt erst mit Stufe 7). Es gibt noch keinen echten Kunden;
die Kette muss trotzdem vollständig prüfbar sein. Beispielseiten und Lead-Demos dürfen nie etwas
verschicken (ADR 0016). Kundenseiten sollen schnell bleiben (DESIGN.md §8: Client-JavaScript nur für
Interaktion).

## Entscheidung

Formular → `POST /api/anfragen/[site]` → Prüfung → zwei E-Mails über Resend → nichts gespeichert.

1. **Empfänger nur aus dem Profil.** Die Route kennt eine Seite nur über ihre Kennung; Empfänger,
   Anfragearten, Öffnungszeiten und Telefon kommen über das Fakten-Gate aus dem Profil
   (`requestTargetFromProfile`: nur Kontext `customer`, E-Mail und Anfragearten müssen ohne
   Einschränkung gelten – ein Vorschlag empfängt keine echten Anfragen). Nichts davon kommt aus dem
   Formular, sonst wäre die Route ein offenes Mail-Relais.
2. **Felder und Regeln** (`src/domain/requests`): Name, E-Mail (Pflicht – dorthin geht die
   Bestätigung), Telefon optional; Tisch: Datum, Uhrzeit, Personen (bis 12, darüber ans Telefon),
   Anmerkung; Abholung: Abholtag, Abholzeit, Bestellung. Geprüft wird in Berliner Ortszeit nur, was
   sicher nicht geht: Vergangenheit, mehr als 90 Tage voraus, am selben Tag weniger als 30 Minuten
   Vorlauf, Ruhetag oder geschlossen (wenn Öffnungszeiten bekannt, auch über Mitternacht). Ob ein Tisch
   frei ist, entscheidet das Haus – eine Anfrage ist keine Buchung.
3. **E-Mails nur als Text.** An den Betrieb mit Antwortadresse des Gastes („einfach antworten“), an den
   Gast mit Antwortadresse des Betriebs und dem Satz „Das ist noch keine Reservierung“. Die Bestätigung
   wiederholt keine Kontaktdaten des Gastes (falls jemand fremde Adressen einträgt). Absenderadresse aus
   `EMAIL_FROM` (verifizierte Studio-Domain), Anzeigename der Betrieb. Der Idempotency-Key ist ein
   SHA-256 über Seite und Anfrage: Ein Doppelklick oder ein wiederholter Versand erzeugt 24 Stunden lang
   keine zweite Mail.
4. **Resend per `fetch`, ohne SDK** (`EmailSenderPort`, Adapter `resend.ts`): 10 Sekunden Zeitlimit,
   Antwort mit Zod geprüft, Fehlerarten `misconfigured`, `rejected`, `duplicate`, `unavailable`. Scheitert
   die Mail an den Betrieb, bekommt der Gast einen Fehler mit Telefonnummer; scheitert nur die
   Bestätigung, gilt die Anfrage als angekommen und die Seite sagt ehrlich, dass keine Bestätigung kam.
   Server-Logs enthalten nur Seite, Anfrageart, Fehlerart und HTTP-Status – nie Namen, Adressen oder
   Inhalte.
5. **Spam und Missbrauch ohne Drittanbieter:**
   - Honigtopf: Die Anfrage wird still verworfen, der Bot sieht Erfolg.
   - Mindest-Ausfülldauer 2,5 Sekunden, nur mit JavaScript gemessen: freundliche Bitte, erneut zu senden.
   - Links in Freitexten werden abgelehnt.
   - Herkunftsprüfung über `Origin`/`Sec-Fetch-Site`, Körper höchstens 16 KB.
   - Rate-Limit im Speicher: 10 Versuche in 10 Minuten je Absender, 3 Anfragen je Stunde je Gast-Adresse
     (niemand wird mit Bestätigungen zugeschüttet) und 30 je Stunde je Betrieb. Fehlerhafte Versuche
     zählen nur beim Absender.
   - Kein Captcha.
6. **Formular mit progressiver Verbesserung** (`compositions/shared`): Ohne JavaScript schickt der
   Browser normal ab, und die Route antwortet mit einer kleinen HTML-Seite. Mit JavaScript bleibt der
   Gast auf der Seite:
   - Fehler stehen am Feld (`aria-invalid`, `aria-describedby`), der Fokus springt zum ersten Fehler.
   - Die Meldung fürs ganze Formular hat `role="alert"`, der Erfolg `role="status"`.
   - Fehler bekommen keine eigene Warnfarbe: Balken, Schriftstärke und Text zeigen sie, die Palette
     gehört dem Haus.
   - Datum und Uhrzeit sind native Felder; ihr Format folgt der Spracheinstellung des Geräts.
   - Scroll-Abstand hält Felder und Knopf über der mobilen Handlungsleiste (WCAG 2.4.11).
7. **Kein Formular-JavaScript auf Beispielseiten.** Gesperrte Formulare (Beispiele, Lead-Demos)
   rendern nur auf dem Server. Das scharfe Formular (`LiveRequestForm`, 19 KB gzip inkl. `zod/mini`)
   importiert nicht die Komposition, sondern die Seite mit Endpunkt – Next.js lädt Client-Code für
   jede Seite, die ihn importiert. Architekturregel 10 prüft das.
8. **Anfrage-Probe** (`/anfrage-probe`, nur `STUDIO_REQUEST_PROBE=local` und localhost): alle
   Beispielhäuser mit scharfen Formularen; die Mail an den „Betrieb“ geht an `STUDIO_OPERATOR_EMAIL`,
   Betreff und Text tragen „Probe“. So lässt sich der ganze Weg mit echtem Resend prüfen, ohne einen
   Betrieb zu stören. Kundenseiten selbst entstehen mit Stufe 6; ihr Anfrageziel ist vorbereitet und
   getestet.
9. **Test-Ersatz statt echter Mails:** `RESEND_BASE_URL` erlaubt eine andere API-Adresse (http nur für
   localhost). Playwright startet `tests/support/mock-resend.mjs` und prüft damit den ganzen Weg,
   einschließlich Seite ohne JavaScript, Doppelklick-Schutz und abgelehnter Bestätigung.
10. **Keine neue Abhängigkeit:** Resend über `fetch`; `zod/mini` ist Teil des vorhandenen Pakets `zod`;
    Radix bleibt bis Stufe 7 draußen – native Felder genügen hier.

## Betrachtete Alternativen

- **Resend-SDK:** bequemer, aber eine Abhängigkeit mit Transitiven für einen einzigen POST.
- **Server Actions statt Route Handler:** CSRF-Schutz und Formular ohne JavaScript wären eingebaut.
  Aber Statuscodes wie 429 mit `Retry-After` lassen sich nicht ausdrücken, Aufrufe von statischen
  Seiten oder anderen Hosts gehen nicht, und ohne Next ist es schwer zu testen.
  ARCHITECTURE.md §4.3 sah die Route ohnehin vor.
- **Captcha (reCAPTCHA, hCaptcha, Turnstile):** fremdes Skript, Datenschutzfrage, Hürde für Gäste.
  Erst wenn Spam trotz der Maßnahmen durchkommt – dann Turnstile mit eigenem ADR.
- **Anfragen mit Löschfrist speichern:** gehört zum Betreiber-Dashboard (Stufe 9); für den Versand
  nicht nötig, und jede Speicherung bringt Löschpflichten.
- **HTML-Mails:** schöner, aber Maskierung, Darstellungsprobleme in Mailprogrammen und die
  Versuchung von Tracking-Pixeln. Text liest sich überall.
- **Eigene Prüffunktion statt `zod/mini` im Browser:** etwa 10 KB kleiner, bricht aber „Zod an jeder
  Grenze“ (CLAUDE.md §6).
- **Rate-Limit in einem Schlüssel-Wert-Dienst (Upstash, Vercel KV):** hält über Instanzen hinweg, ist
  aber ein weiterer, später kostenpflichtiger Dienst. Bis Stufe 7 genügt der Speicher im Prozess.

## Konsequenzen

- Das Rate-Limit gilt je Server-Instanz. Laufen mehrere Instanzen, wird es weicher.
  `X-Forwarded-For` ist nur hinter einem Proxy verlässlich, der es setzt (Vercel). Vor dem
  Livegang (Stufe 6) die Firewall- und Rate-Limit-Regeln des Hosters prüfen.
- Resend Free schafft 100 Mails am Tag, also 50 Anfragen über alle Kunden. Vor dem zweiten Kunden
  den Tarif prüfen.
- Resend-Einrichtung:
  - Absenderdomain mit SPF/DKIM verifizieren.
  - EU-Region wählen.
  - Auftragsverarbeitungsvertrag abschließen.
  - Öffnungs- und Klick-Tracking ausschalten.
- Resend bewahrt versandte Nachrichten eine Zeit lang auf – die Frist vor dem Livegang prüfen.
- Datenschutzerklärung jeder Kundenseite: Sie muss den Versand über Resend, den Zweck und die
  Rechtsgrundlage nennen (Stufe 6). Verantwortlicher ist der Betrieb, das Studio Auftragsverarbeiter.
- Kundenseiten (Stufe 6) müssen die Verdrahtung (`requests`: Endpunkt und `LiveRequestForm`)
  übergeben. Sonst zeigen sie das gesperrte Demo-Formular. Stufe 6 prüft das mit einem Test je
  Kundenseite.
- Gästedaten liegen nur in den beiden Postfächern. Mit dem Betreiber-Dashboard (Stufe 9) ist neu zu
  entscheiden, ob Anfragen gespeichert werden.
