# 0012 – Produktplan übernommen: Stufen neu geordnet

- **Status:** angenommen
- **Datum:** 2026-09-23
- **Bezug:** ROADMAP.md, MIGRATION.md §6, ARCHITECTURE.md, DESIGN.md §2 und §10

## Kontext

Der Inhaber hat einen Gesamtplan vorgelegt: Stack (Next.js, TypeScript, Tailwind, Supabase, Vercel,
Resend, Google Places, dazu Cloudflare, Sentry, Plausible/Umami, später Stripe), ein Monorepo als
Zielstruktur, Reservierung/Bestellung in drei Phasen, gastro-v3 als weiterlaufender
Vertriebsprototyp und der erste echte Kunde als Referenzprojekt. Die Foundation-Reihenfolge
(Lead-Recherche vor Datenbank vor Betrieb) passte dazu nicht in allen Punkten.

## Entscheidung

1. **Reihenfolge nach Umsatzweg:** Nach dem Fachkern kommen Design Directions, die erste
   Kundenseite, der Conversion-Layer und der Livegang (Stufen 1–6). Datenbank/Studio-Dashboard
   (7), Lead-Recherche (8), Betreiber-Dashboard (9) und eigene Bestellstrecke (10) folgen.
   Die Stufennummern in ADR 0001–0011 und der ersten MIGRATION.md-Fassung sind damit überholt:
   alt 5 → 8, alt 6 → 7, alt 7 → 5/9/10, alt 8 → 6.
2. **gastro-v3 bleibt Vertriebsprototyp** bis Stufe 8 und wird aus studio-os heraus nicht verändert.
   Die im Plan genannten Stabilitätsprobleme sind dort bereits behoben (CI grün auf `main` @ `ddcad23`,
   Suchbutton mit PR #2).
3. **Ein Repository, eine App, geprüfte Modulgrenzen** (ADR 0003 bleibt). Die Monorepo-Struktur
   des Plans ist die Zielabbildung (ROADMAP.md §5). Auslöser für Workspaces ist ein getrenntes
   Deployment von Studio und Kundenseiten, spätestens geprüft in Stufe 7.
4. **Conversion-Layer vor eigenem Buchungssystem:** Stufe 5 verschickt Anfragen per E-Mail und
   speichert keine Gästedaten. Tischlogik, No-Show und Zahlung erst in Stufe 10.
5. **Zwei Ebenen der Gestaltung:** Die *Design Direction* des Plans (Stimmung, Tokens,
   Layout-Vokabular) ist der wiederverwendbare Startpunkt; die *Creative Direction* je Haus
   entscheidet und begründet (DESIGN.md §10).
6. **Radix/shadcn nur für Funktionales** (DESIGN.md §2). Die Abhängigkeit wird mit dem ersten
   Formular (Stufe 5) bzw. dem Dashboard (Stufe 7) per eigenem ADR aufgenommen.
7. **Neue Dienste im Integrationsplan:** Cloudflare (DNS/Domains), Sentry (Fehler), Plausible oder
   Umami (cookielose Analytics), Stripe (Stufe 10), externe Buchungssysteme als Links.

## Betrachtete Alternativen

- **Sofort Monorepo mit Workspaces:** Der Plan sagt selbst, dass es für den ersten Kunden nicht
  nötig ist; Werkzeugaufwand ohne heutigen Nutzen.
- **Lead-Recherche zuerst nachbauen:** gastro-v3 leistet das bereits; ein Nachbau vor dem ersten
  Kunden würde Umsatz verzögern.
- **Gleich ein eigenes Reservierungssystem (v1-Logik):** höchstes Risiko (Gästedaten, Kapazität,
  Rechtliches) für den geringsten Anteil am Nutzen kleiner Betriebe.

## Konsequenzen

- CLAUDE.md, ARCHITECTURE.md, DESIGN.md und MIGRATION.md verweisen auf ROADMAP.md als Reihenfolge.
- Die Regel „keine Datenbankmigration vor dem Dashboard-Schritt“ gilt jetzt für Stufe 7.
- Bis Stufe 7 leben die Inhalte einer Kundenseite als versionierte Datei im Repository – sie sind
  ohnehin öffentlich. Interne Notizen, Kontaktpersonen und Gästedaten nie.
