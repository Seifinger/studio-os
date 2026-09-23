import { defineShowcase, week } from "../define";

export const bistroSiebzehn = defineShowcase({
  slug: "bistro-siebzehn",
  direction: "bistro-leinen",
  facts: {
    name: "Bistro Siebzehn",
    locality: "Seewinkel",
    cuisine: "international",
    address: { street: "Seestraße 17", postalCode: "00582", locality: "Seewinkel" },
    phone: "089 99998 114",
    conceptShort: "Bistro mit Mittagskarte, die jeden Tag neu geschrieben wird, und einem Abendmenü in drei Gängen.",
    story:
      "Johanna Pfeiffer hat in Lyon und Kopenhagen gekocht und 2021 das Bistro in der Seestraße 17 eröffnet – daher der Name. Mittags gibt es drei Gerichte, die sie morgens festlegt, abends ein Menü in drei Gängen. Das Leinen auf den Tischen wäscht die Wäscherei im Ort; das Brot kommt vom Bäcker gegenüber.",
    usp: "Mittags drei Gerichte, jeden Tag neu – abends drei Gänge für 54 Euro.",
    specials: ["Mittag: Kalbsleber mit Apfel und Kartoffelpüree", "Mittag: Kichererbsen-Curry mit Joghurt", "Mittag: Saibling mit Beurre blanc"],
    menu: {
      sections: [
        { title: "Vorspeise", items: [{ name: "Rote Bete, Meerrettich, Dill", priceCents: 1300, dietary: ["vegetarisch"], allergens: ["milch"] }, { name: "Kalbstatar mit Kapern", priceCents: 1600, allergens: ["eier", "senf"] }] },
        { title: "Hauptgang", items: [{ name: "Maishähnchen, Estragon, Pommes Anna", priceCents: 2800, allergens: ["milch", "sulfite"] }, { name: "Risotto mit Kürbis und Salbei", priceCents: 2300, dietary: ["vegetarisch"], allergens: ["milch", "sellerie", "sulfite"] }] },
        { title: "Dessert", items: [{ name: "Crème caramel", priceCents: 900, dietary: ["vegetarisch"], allergens: ["eier", "milch"] }, { name: "Käse vom Affineur", priceCents: 1400, dietary: ["vegetarisch"], allergens: ["milch", "schalenfruechte"] }] },
      ],
      note: "Drei Gänge nach Wahl 54 Euro. Die Mittagskarte steht jeden Morgen auf der Tafel.",
    },
    openingHours: week(
      { di: "12:00-14:30 18:00-22:30", mi: "12:00-14:30 18:00-22:30", do: "12:00-14:30 18:00-22:30", fr: "12:00-14:30 18:00-23:00", sa: "18:00-23:00" },
      "Abendmenü ab 18 Uhr, letzte Bestellung 21:30 Uhr.",
    ),
    serviceNotes: ["Mittags nehmen wir keine Reservierungen für weniger als vier Personen an.", "Ein Tisch für sechs steht im Hinterzimmer, auch für kleine Feiern."],
    requestChannels: { table: true, pickup: false },
    primaryAction: "tableRequest",
    priceLevel: "upscale",
  },
  creative: {
    idea: "Das Bistro als gestärktes Leinen: ruhig, klar, die Mittagskarte als Zettel neben der Serviette.",
    effect: "Man sieht die drei Mittagsgerichte und versteht, dass hier jeden Tag neu gekocht wird.",
    metaphor: "Ein weißes Leinentuch mit Tintenschrift, daneben die tägliche Karte, mit der Hand geschrieben.",
    dramaturgy: [
      { section: "hero", weight: "gross", why: "Name und drei Mittagsgerichte – das ist die Nachricht des Tages." },
      { section: "menu", weight: "gross", title: "Abends drei Gänge", why: "Das Abendmenü in Gängen gliedert den Abend." },
      { section: "story", weight: "normal", title: "Lyon, Kopenhagen, Seestraße 17", why: "Der Name erklärt sich aus der Hausnummer; die Stationen aus der Küche." },
      { section: "imageSlots", weight: "normal", title: "Tafel, Tisch, Teller", why: "Leinen und Licht sind Stimmung, die nur ein echtes Foto zeigt." },
      { section: "hours", weight: "normal", title: "Mittags und abends", why: "Zwei Zeiten, zwei Karten – beide klar." },
      { section: "request", weight: "normal", why: "Abends wird reserviert, mittags meist nicht." },
      { section: "serviceNotes", weight: "klein", title: "Mittags und Hinterzimmer", why: "Die Mittagsregel erspart Missverständnisse." },
      { section: "visit", weight: "normal", title: "Seestraße 17", why: "Die Hausnummer ist der Name." },
    ],
    signatures: [{ title: "Mittagskarte im Kopf", description: "Die drei Mittagsgerichte stehen im Kopf der Seite wie der Zettel neben der Serviette.", evidence: ["specials"] }],
    omissions: ["Keine Weinglas-Stockfotos", "Keine französischen Floskeln", "Keine Schreibschrift als Titel"],
  },
  imageSlots: [
    { id: "tafel", subject: "detail", role: "orientierung", motif: "Die Tafel mit der Mittagskarte an der Wand neben der Tür", alt: "Tafel mit der Mittagskarte des Bistros", crop: { desktop: "4:5", mobile: "4:5", focus: { x: 50, y: 45 } }, asset: null },
    { id: "tisch", subject: "raum", role: "stimmung", motif: "Gedeckter Tisch mit Leinen am Fenster zur Seestraße, Mittagslicht", alt: "Gedeckter Tisch mit Leinen am Fenster", crop: { desktop: "3:2", mobile: "4:5", focus: { x: 50, y: 50 } }, asset: null },
    { id: "haehnchen", subject: "gericht", role: "beweis", motif: "Maishähnchen mit Estragon und Pommes Anna auf weißem Teller", dish: "Maishähnchen, Estragon, Pommes Anna", alt: "Maishähnchen mit Estragonsoße und Pommes Anna", crop: { desktop: "4:5", mobile: "4:5", focus: { x: 50, y: 50 } }, asset: null },
  ],
});
