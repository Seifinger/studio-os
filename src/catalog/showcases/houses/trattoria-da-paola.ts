import { defineShowcase, week } from "../define";

export const trattoriaDaPaola = defineShowcase({
  slug: "trattoria-da-paola",
  direction: "trattoria-kochbuch",
  facts: {
    name: "Trattoria da Paola",
    locality: "Aubrunn",
    cuisine: "italienisch",
    address: { street: "Brunnengasse 3", postalCode: "00318", locality: "Aubrunn" },
    phone: "089 99998 102",
    conceptShort: "Trattoria in einer alten Metzgerei: vier Gänge, jeden Dienstag neu geschrieben, die Pasta vom selben Morgen.",
    story:
      "Paola Russo ist in Parma aufgewachsen und hat 2014 in Aubrunn aufgemacht, in der ehemaligen Metzgerei an der Brunnengasse. Die Pasta rollt sie jeden Morgen selbst aus; ab halb zehn sieht man ihr durchs Fenster dabei zu. Die Karte schreibt sie dienstags neu, nach dem, was der Markt hergibt. Was aus ist, ist aus.",
    usp: "Die Pasta wird jeden Morgen ausgerollt, nur so viel, wie der Abend braucht.",
    specials: ["Tortelli mit Kürbis, Amaretti und Salbeibutter", "Kalbsbraten mit Zitronensoße und Ofenkartoffeln", "Birnen in Rotwein mit Mascarpone"],
    signatureDishes: ["Tortelli d'erbetta mit brauner Butter", "Tagliatelle al ragù, sechs Stunden geschmort", "Torta di riso aus Parma"],
    menu: {
      sections: [
        {
          title: "Antipasti",
          items: [
            { name: "Culatello mit eingelegten Zwiebeln", priceCents: 1250, allergens: ["sulfite"] },
            { name: "Burrata mit geröstetem Kürbis", description: "Haselnuss, Rosmarinöl", priceCents: 1100, dietary: ["vegetarisch"], allergens: ["milch", "schalenfruechte"] },
            { name: "Vitello tonnato", description: "Kalbsnuss, Thunfischsoße, Kapern", priceCents: 1350, allergens: ["fisch", "eier", "senf"] },
          ],
        },
        {
          title: "Primi",
          items: [
            { name: "Tortelli d'erbetta", description: "Mangold und Ricotta, braune Butter, Parmigiano", priceCents: 1550, dietary: ["vegetarisch"], allergens: ["gluten", "eier", "milch"] },
            { name: "Tagliatelle al ragù", description: "Rind und Schwein, sechs Stunden geschmort", priceCents: 1600, allergens: ["gluten", "eier", "sellerie", "sulfite"] },
            { name: "Risotto mit Radicchio", description: "Taleggio, Walnuss", priceCents: 1500, dietary: ["vegetarisch"], allergens: ["milch", "sellerie", "sulfite", "schalenfruechte"] },
          ],
        },
        {
          title: "Secondi",
          items: [
            { name: "Kalbsbraten mit Zitronensoße", description: "Ofenkartoffeln, Salbei", priceCents: 2400, allergens: ["milch", "sellerie", "sulfite"] },
            { name: "Wolfsbarsch aus dem Ofen", description: "Fenchel, Oliven, Zitrone", priceCents: 2600, allergens: ["fisch"] },
          ],
        },
        {
          title: "Dolci",
          items: [
            { name: "Torta di riso", description: "Reiskuchen nach Parmaer Art", priceCents: 700, dietary: ["vegetarisch"], allergens: ["eier", "milch"] },
            { name: "Birnen in Rotwein", description: "Mascarpone, Zimt", priceCents: 750, dietary: ["vegetarisch"], allergens: ["milch", "sulfite"] },
          ],
        },
      ],
      note: "Die Karte wechselt jeden Dienstag. Jede Pasta gibt es auch als halbe Portion.",
    },
    openingHours: week(
      { di: "18:00-23:00", mi: "18:00-23:00", do: "18:00-23:00", fr: "18:00-23:00", sa: "12:00-14:30 18:00-23:00", so: "12:00-15:00" },
      "Küche bis 22:00 Uhr.",
    ),
    serviceNotes: ["Tische für mehr als sechs Personen bitte telefonisch.", "Glutenfreie Pasta auf Vorbestellung – bitte bei der Anfrage angeben."],
    requestChannels: { table: true, pickup: false },
    primaryAction: "tableRequest",
    priceLevel: "mid",
  },
  creative: {
    idea: "Die Trattoria als aufgeschlagenes Kochbuch: Gänge wie Kapitel, die Wochenkarte als eingelegter Zettel.",
    effect: "Man sieht zuerst den Namen wie auf einem Buchumschlag, dann die Wochenkarte, und versteht, dass hier jede Woche neu gekocht wird.",
    metaphor: "Ein Kochbuch mit Kapiteln in römischen Ziffern, cremefarbenem Papier und Rotbraun als Tinte.",
    dramaturgy: [
      { section: "hero", weight: "gross", why: "Der Name steht groß wie auf einem Buchumschlag, darunter ein Satz, was das Haus ist." },
      { section: "specials", weight: "gross", title: "Diese Woche auf der Karte", why: "Die Wochenkarte ist der Grund wiederzukommen – sie steht vor allem anderen." },
      { section: "menu", weight: "gross", title: "Vier Gänge, dienstags neu", why: "Die Gänge gliedern die Karte wie Kapitel; die Preise stehen ruhig am Rand." },
      { section: "story", weight: "normal", title: "Aus Parma in die Brunnengasse", why: "Paola und die Pasta am Morgen belegen alles, was auf der Karte steht." },
      { section: "signatureDishes", weight: "normal", title: "Was immer auf der Karte bleibt", why: "Drei Gerichte ändern sich nie; Stammgäste fragen danach." },
      { section: "imageSlots", weight: "normal", title: "Pasta am Morgen, Tortelli, Gastraum", why: "Das Ausrollen am Fenster ist das stärkste Bild des Hauses – es braucht ein echtes Foto." },
      { section: "hours", weight: "klein", title: "Abends, am Wochenende auch mittags", why: "Wenige Öffnungszeiten, knapp gesetzt." },
      { section: "request", weight: "normal", why: "Tische vergibt Paola selbst; die Anfrage landet bei ihr, nicht in einem Buchungssystem." },
      { section: "visit", weight: "klein", title: "Brunnengasse 3, Aubrunn", why: "Die Gasse ist klein; Adresse und Weg genügen." },
    ],
    signatures: [
      { title: "Wochenkarte als eingelegter Zettel", description: "Die Wochenkarte steht als gerahmte Tafel direkt nach dem Namen.", evidence: ["specials"] },
      { title: "Gänge in römischen Ziffern", description: "Die Karte ist in Gänge gegliedert wie die Kapitel eines Kochbuchs, mit großen römischen Ziffern.", evidence: ["menu"] },
    ],
    omissions: ["Kein Rot-Weiß-Grün, keine Flaggen", "Keine Postkartenbilder aus Italien", "Keine Online-Reservierung – die Tische vergibt Paola selbst"],
  },
  imageSlots: [
    {
      id: "pasta-am-fenster",
      subject: "team",
      role: "beweis",
      motif: "Paola rollt morgens Pasta aus, fotografiert durch das Fenster zur Gasse",
      alt: "Paola Russo rollt Pastateig am Fenster zur Brunnengasse aus",
      crop: { desktop: "21:9", mobile: "4:5", focus: { x: 45, y: 50 } },
      asset: null,
    },
    {
      id: "tortelli",
      subject: "gericht",
      role: "beweis",
      motif: "Tortelli d'erbetta mit brauner Butter, von schräg oben, auf dem weißen Hausteller",
      dish: "Tortelli d'erbetta",
      alt: "Tortelli d'erbetta mit brauner Butter und Parmigiano",
      crop: { desktop: "3:2", mobile: "1:1", focus: { x: 50, y: 50 } },
      asset: null,
    },
    {
      id: "gastraum",
      subject: "raum",
      role: "stimmung",
      motif: "Der Gastraum am frühen Abend, die weißen Kacheln der alten Metzgerei, Kerzen auf den Tischen",
      alt: "Gastraum der Trattoria mit den Kacheln der ehemaligen Metzgerei",
      crop: { desktop: "3:2", mobile: "4:5", focus: { x: 50, y: 50 } },
      asset: null,
    },
  ],
});
