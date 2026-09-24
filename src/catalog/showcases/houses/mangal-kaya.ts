import { defineShowcase, week } from "../define";

export const mangalKaya = defineShowcase({
  slug: "mangal-kaya",
  direction: "grillhaus-tafel",
  facts: {
    name: "Mangal Kaya",
    locality: "Tallingen",
    cuisine: "tuerkisch",
    address: { street: "Bahnhofstraße 21", postalCode: "00644", locality: "Tallingen" },
    phone: "089 99998 104",
    conceptShort: "Holzkohlegrill an der Bahnhofstraße: Adana, Lammspieße und Pide, zum Mitnehmen oder am Tresen.",
    story:
      "Mehmet Kaya hat das Grillen in Gaziantep gelernt und 2016 den Mangal an der Bahnhofstraße angeheizt. Gegrillt wird nur über Holzkohle, das Hackfleisch für den Adana schneidet er mit dem Wiegemesser. Seine Schwester Ayşe backt Pide und Lahmacun im Steinofen gleich daneben.",
    usp: "Nur Holzkohle, kein Gas – und das Adana-Hack wird mit dem Wiegemesser geschnitten, nicht durch den Wolf gedreht.",
    specials: ["Heute auf dem Mangal: Lammkoteletts mit Sumach-Zwiebeln", "Aus dem Steinofen: Pide mit Sucuk und Ei", "Nachtisch: Künefe, warm aus der Pfanne"],
    signatureDishes: ["Adana vom Wiegemesser", "Lahmacun aus dem Steinofen", "Künefe"],
    menu: {
      sections: [
        {
          title: "Vom Mangal",
          note: "Mit Bulgur, gegrillter Paprika und Sumach-Zwiebeln.",
          items: [
            { name: "Adana", description: "scharfes Lammhack vom Wiegemesser", priceCents: 1650, dietary: ["scharf"], allergens: [] },
            { name: "Lammspieß", description: "Keule, mariniert in Joghurt", priceCents: 1850, allergens: ["milch"] },
            { name: "Hähnchenflügel", description: "Paprikamark, Zitrone", priceCents: 1350, allergens: ["sellerie"] },
            { name: "Gegrilltes Gemüse", description: "Aubergine, Paprika, Tomate, Hirtenkäse", priceCents: 1200, dietary: ["vegetarisch"], allergens: ["milch"] },
          ],
        },
        {
          title: "Aus dem Steinofen",
          items: [
            { name: "Lahmacun", description: "dünn, mit Petersilie und Zitrone", priceCents: 650, allergens: ["gluten"] },
            { name: "Pide mit Sucuk und Ei", priceCents: 1150, allergens: ["gluten", "eier", "milch"] },
            { name: "Pide mit Spinat und Hirtenkäse", priceCents: 1050, dietary: ["vegetarisch"], allergens: ["gluten", "milch"] },
          ],
        },
        {
          title: "Meze",
          items: [
            { name: "Ezme", description: "gehackte Tomate, Paprika, Granatapfelsirup", priceCents: 550, dietary: ["vegan", "scharf"], allergens: [] },
            { name: "Haydari", description: "abgetropfter Joghurt, Minze", priceCents: 550, dietary: ["vegetarisch"], allergens: ["milch"] },
            { name: "Linsensuppe", description: "mit Zitrone und Pul Biber", priceCents: 600, dietary: ["vegan"], allergens: ["sellerie"] },
          ],
        },
        {
          title: "Süßes",
          items: [
            { name: "Künefe", description: "Engelshaar, Käse, Sirup, Pistazie", priceCents: 800, dietary: ["vegetarisch"], allergens: ["gluten", "milch", "schalenfruechte"] },
            { name: "Sütlaç", description: "Milchreis aus dem Ofen", priceCents: 550, dietary: ["vegetarisch"], allergens: ["milch"] },
          ],
        },
      ],
      note: "Alles auch zum Mitnehmen. Preise in Euro inklusive Mehrwertsteuer.",
    },
    openingHours: week(
      { di: "11:00-22:00", mi: "11:00-22:00", do: "11:00-22:00", fr: "11:00-23:00", sa: "11:00-23:00", so: "12:00-21:00" },
      "Der Grill brennt bis eine halbe Stunde vor Schluss.",
    ),
    serviceNotes: ["Bestellungen zum Abholen sind nach etwa 20 Minuten fertig.", "Am Tresen ist Platz für zwölf, Reservierungen nehmen wir nicht an."],
    requestChannels: { table: false, pickup: true },
    primaryAction: "pickupRequest",
    priceLevel: "budget",
  },
  creative: {
    idea: "Mangal Kaya als Plakat über dem Grill: ein Wort, ein Rot, darunter was heute brennt.",
    effect: "In drei Sekunden: Holzkohlegrill, was es heute gibt, und dass man vorbestellen und abholen kann.",
    metaphor: "Die Preistafel über dem Holzkohlegrill, mit breiter Plakatschrift in einem einzigen Rot.",
    dramaturgy: [
      { section: "hero", weight: "gross", why: "Der Name ist das Plakat; nichts daneben lenkt ab." },
      { section: "specials", weight: "normal", title: "Heute auf dem Mangal", why: "Was heute auf dem Grill liegt, entscheidet die Bestellung." },
      { section: "menu", weight: "gross", title: "Vom Grill, aus dem Ofen", why: "Die Karte ist eine Preistafel: Name, Punktlinie, Preis, ohne Umwege." },
      { section: "request", weight: "gross", title: "Vorbestellen und abholen", why: "Die meisten Gäste nehmen mit; das Formular spart die Schlange am Tresen." },
      { section: "story", weight: "normal", title: "Gaziantep, Bahnhofstraße", why: "Holzkohle und Wiegemesser sind der Beleg für den Geschmack." },
      { section: "imageSlots", weight: "normal", title: "Glut, Spieße, Steinofen", why: "Das Feuer ist das stärkste Motiv des Hauses." },
      { section: "hours", weight: "klein", title: "Dienstag bis Sonntag", why: "Lange Öffnungszeiten, knapp gesetzt." },
      { section: "serviceNotes", weight: "klein", title: "Abholen und Tresen", why: "Wartezeit und fehlende Reservierung ehrlich nennen." },
      { section: "visit", weight: "normal", title: "Zwei Minuten vom Bahnhof", why: "Viele kommen zu Fuß vom Zug; der Weg gehört nach vorn." },
    ],
    signatures: [{ title: "Tafel über dem Grill", description: "Die Tagesangebote stehen als eingerahmte Tafel in der Plakatschrift, direkt unter dem Namen.", evidence: ["specials"] }],
    omissions: ["Keine Ornamente, keine Kacheln als Muster", "Keine Döner-Stockfotos", "Kein Orient-Vokabular"],
  },
  imageSlots: [
    { id: "glut", subject: "detail", role: "stimmung", motif: "Glühende Holzkohle unter dem Rost, Spieße von der Seite", alt: "Spieße über glühender Holzkohle", crop: { desktop: "21:9", mobile: "4:5", focus: { x: 50, y: 60 } }, asset: null },
    { id: "adana", subject: "gericht", role: "beweis", motif: "Adana auf Fladenbrot mit Sumach-Zwiebeln und gegrillter Paprika", dish: "Adana", alt: "Adana-Spieß auf Fladenbrot mit gegrillter Paprika", crop: { desktop: "3:2", mobile: "1:1", focus: { x: 50, y: 50 } }, asset: null },
    { id: "steinofen", subject: "team", role: "beweis", motif: "Ayşe schiebt Pide mit dem Holzschieber in den Steinofen", alt: "Ayşe Kaya schiebt Pide in den Steinofen", crop: { desktop: "3:2", mobile: "4:5", focus: { x: 40, y: 50 } }, asset: null },
  ],
});
