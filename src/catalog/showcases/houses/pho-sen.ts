import { defineShowcase, week } from "../define";

export const phoSen = defineShowcase({
  slug: "pho-sen",
  direction: "strassenkueche-kraeuter",
  facts: {
    name: "Phở Sen",
    locality: "Tannried",
    cuisine: "vietnamesisch",
    address: { street: "Marktstraße 14", postalCode: "00427", locality: "Tannried" },
    phone: "089 99998 108",
    conceptShort: "Vietnamesische Mittagsküche: Phở mit zwölf Stunden Brühe und ein Teller Kräuter zu jeder Schale.",
    story:
      "Lan und Minh Tran haben Phở Sen 2018 eröffnet, nachdem Lan zwanzig Jahre lang für Familie und Freunde gekocht hatte. Die Rinderbrühe setzt Minh am Abend an, mit gerösteten Zwiebeln, Ingwer und Sternanis; am nächsten Mittag ist sie fertig. Koriander, Thai-Basilikum und Minze kommen jeden Morgen frisch vom Gärtner aus dem Nachbarort.",
    usp: "Zwölf Stunden Brühe und ein voller Teller Kräuter zu jeder Schale – ohne Aufpreis.",
    specials: ["Mittagsschale mit Frühlingsrolle: 12,90 Euro", "Donnerstag: Bún Chả mit gegrilltem Schweinebauch"],
    signatureDishes: ["Phở Bò mit Rinderbrust", "Bún Chả", "Gỏi cuốn mit Garnelen"],
    menu: {
      sections: [
        {
          title: "Phở",
          note: "Mit Reisnudeln, Kräutern, Limette und Chili zum Selbstwürzen.",
          items: [
            { name: "Phở Bò", description: "Rinderbrust und Filet, roh in die heiße Brühe", priceCents: 1350, allergens: ["fisch", "sellerie"] },
            { name: "Phở Gà", description: "Hähnchenbrühe, Hähnchenkeule", priceCents: 1250, allergens: ["fisch", "sellerie"] },
            { name: "Phở Chay", description: "Gemüsebrühe, Tofu, Pilze", priceCents: 1200, dietary: ["vegan"], allergens: ["soja", "sellerie"] },
          ],
        },
        {
          title: "Bún und Reis",
          items: [
            { name: "Bún Chả", description: "gegrillter Schweinebauch, Reisnudeln, Fischsoße", priceCents: 1400, allergens: ["fisch", "soja"] },
            { name: "Cơm Tấm", description: "Bruchreis, Kotelett, Spiegelei", priceCents: 1350, allergens: ["eier", "fisch", "soja"] },
          ],
        },
        {
          title: "Zum Teilen",
          items: [
            { name: "Gỏi cuốn", description: "Sommerrollen mit Garnelen, Erdnusssoße", priceCents: 750, allergens: ["krebstiere", "erdnuesse", "soja"] },
            { name: "Chả giò", description: "frittierte Frühlingsrollen", priceCents: 700, allergens: ["gluten", "eier", "soja"] },
          ],
        },
      ],
    },
    openingHours: week(
      { di: "11:30-15:00 17:30-21:00", mi: "11:30-15:00 17:30-21:00", do: "11:30-15:00 17:30-21:00", fr: "11:30-15:00 17:30-21:30", sa: "12:00-21:30" },
      "Solange die Brühe reicht – an vollen Tagen ist abends früher Schluss.",
    ),
    serviceNotes: ["Mittags geht es schnell: Die Schale steht nach fünf Minuten auf dem Tisch.", "Phở zum Mitnehmen gibt es mit Brühe und Nudeln getrennt verpackt."],
    requestChannels: { table: false, pickup: true },
    primaryAction: "pickupRequest",
    priceLevel: "budget",
  },
  creative: {
    idea: "Phở Sen als Mittagszettel an der Marktstraße: kurz, grün, mit der Brühe als Hauptsache.",
    effect: "In drei Sekunden: Mittagsschale, Preis, schnell – und dass man vorbestellen kann.",
    metaphor: "Ein Schreibblock mit Kräuterblättern als Lesezeichen, die Karte in sauberer Buchschrift.",
    dramaturgy: [
      { section: "hero", weight: "gross", why: "Name und Mittagsangebot nebeneinander; mittags zählt jede Sekunde." },
      { section: "menu", weight: "gross", title: "Brühe, Kräuter, Reisnudeln", why: "Die Karte ist kurz; als Liste mit Punktlinien ist sie schneller gelesen als als Karten." },
      { section: "request", weight: "normal", title: "Vorbestellen zum Abholen", why: "Viele holen mittags ab; die Bestellung spart die Schlange." },
      { section: "hours", weight: "normal", title: "Mittags und abends, Dienstag bis Samstag", why: "Die Mittagspause ist kurz, die Zeiten müssen stimmen." },
      { section: "story", weight: "normal", title: "Zwölf Stunden für eine Schale", why: "Die Brühe über Nacht erklärt den Geschmack." },
      { section: "serviceNotes", weight: "klein", title: "Schnell und zum Mitnehmen", why: "Wie Mitnehmen funktioniert, gehört auf die Seite." },
      { section: "visit", weight: "normal", title: "Marktstraße 14", why: "Adresse und Telefon." },
    ],
    signatures: [{ title: "Brühe als Hauptsache", description: "Die Geschichte der Brühe steht mit der Dauer als Überschrift – zwölf Stunden sind der Beleg.", evidence: ["story"] }],
    omissions: ["Keine Reisfelder, keine Kegelhüte", "Keine Bambus-Grafiken", "Keine Fotos, bis es echte Bilder der Schalen gibt"],
  },
  imageSlots: [],
});
