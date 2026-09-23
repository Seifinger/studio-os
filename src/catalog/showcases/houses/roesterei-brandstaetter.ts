import { defineShowcase, week } from "../define";

export const roestereiBrandstaetter = defineShowcase({
  slug: "roesterei-brandstaetter",
  direction: "roesterei-werkbank",
  facts: {
    name: "Rösterei Brandstätter",
    locality: "Hollerau",
    cuisine: "cafe",
    address: { street: "Werkstattgasse 2", postalCode: "00795", locality: "Hollerau" },
    phone: "089 99998 112",
    conceptShort: "Café in einer alten Schreinerei, mit Röstmaschine im Raum: Filterkaffee, Frühstück bis 14 Uhr, Kuchen vom Blech.",
    story:
      "Lena Brandstätter hat 2017 die Werkstatt ihres Großvaters übernommen, einer Schreinerei, und eine Röstmaschine dort hingestellt, wo früher die Hobelbank stand. Geröstet wird dienstags und donnerstags, in kleinen Mengen zu fünf Kilo. Die Kuchen backt ihr Kollege Jonas am Morgen im selben Raum.",
    usp: "Geröstet wird im Raum, dienstags und donnerstags – man riecht es bis auf die Gasse.",
    specials: ["Heute im Filter: Äthiopien Guji und Kolumbien Huila", "Vom Blech: Zwetschgendatschi mit Streuseln"],
    menu: {
      sections: [
        {
          title: "Kaffee",
          items: [
            { name: "Filterkaffee", description: "zwei Bohnen zur Wahl", priceCents: 350, dietary: ["vegan"] },
            { name: "Espresso", priceCents: 250, dietary: ["vegan"] },
            { name: "Cappuccino", description: "auch mit Hafermilch", priceCents: 390, dietary: ["vegetarisch"], allergens: ["milch"] },
            { name: "Bohnen zum Mitnehmen", priceNote: "250 g ab 11,00 €", dietary: ["vegan"] },
          ],
        },
        {
          title: "Frühstück",
          note: "Bis 14 Uhr.",
          items: [
            { name: "Sauerteigbrot mit Butter und Marmelade", priceCents: 550, dietary: ["vegetarisch"], allergens: ["gluten", "milch"] },
            { name: "Rührei auf Brot", description: "Schnittlauch, Bergkäse", priceCents: 950, dietary: ["vegetarisch"], allergens: ["gluten", "eier", "milch"] },
            { name: "Granola", description: "Joghurt, Apfelkompott", priceCents: 750, dietary: ["vegetarisch"], allergens: ["gluten", "milch", "schalenfruechte"] },
          ],
        },
        {
          title: "Kuchen",
          items: [
            { name: "Kuchen vom Blech", description: "je nach Saison", priceCents: 420, dietary: ["vegetarisch"], allergens: ["gluten", "eier", "milch"] },
            { name: "Zimtschnecke", priceCents: 380, dietary: ["vegetarisch"], allergens: ["gluten", "eier", "milch"] },
          ],
        },
      ],
    },
    openingHours: week({ mo: "08:00-17:00", di: "08:00-17:00", mi: "08:00-17:00", do: "08:00-17:00", fr: "08:00-17:00", sa: "09:00-17:00" }, "Sonntags ruht die Werkstatt."),
    serviceNotes: ["Samstags keine Reservierungen – die Tische werden frei vergeben.", "Laptops gern unter der Woche, am Samstag lieber nicht."],
    requestChannels: { table: true, pickup: false },
    primaryAction: "menu",
    priceLevel: "mid",
  },
  creative: {
    idea: "Die Rösterei als Werkbank: Holz, Papier, eine große Schrift und der Kaffee des Tages auf einem Zettel.",
    effect: "Man sieht sofort, was heute im Filter ist, und dass hier geröstet wird.",
    metaphor: "Eine alte Hobelbank mit Kaffeesäcken, die Karte wie ein Werkstattzettel mit Preisen.",
    dramaturgy: [
      { section: "hero", weight: "gross", why: "Name und Kaffee des Tages nebeneinander, wie die Tafel am Tresen." },
      { section: "menu", weight: "gross", title: "Kaffee, Frühstück, Kuchen", why: "Drei kurze Abschnitte, ruhig gesetzt." },
      { section: "story", weight: "normal", title: "Wo früher die Hobelbank stand", why: "Die Werkstatt erklärt Raum und Namen." },
      { section: "imageSlots", weight: "normal", title: "Röster, Tresen, Blech", why: "Die Röstmaschine im Raum ist das Bild des Hauses." },
      { section: "hours", weight: "normal", title: "Montag bis Samstag, ab acht", why: "Frühe Zeiten sind für ein Café entscheidend." },
      { section: "serviceNotes", weight: "klein", title: "Samstag und Laptops", why: "Zwei Hausregeln, freundlich gesagt." },
      { section: "visit", weight: "normal", title: "Werkstattgasse 2", why: "Die Gasse ist klein; Adresse und Nummer." },
    ],
    signatures: [{ title: "Kaffee des Tages im Kopf", description: "Die Bohnen des Tages stehen im Kopf der Seite wie der Zettel am Tresen.", evidence: ["specials"] }],
    omissions: ["Keine Latte-Art-Stockfotos", "Keine Kaffeebohnen als Muster", "Kein Third-Wave-Englisch"],
  },
  imageSlots: [
    { id: "roester", subject: "detail", role: "beweis", motif: "Die Röstmaschine beim Auswurf, Bohnen im Kühlsieb", alt: "Röstmaschine beim Auswurf frisch gerösteter Bohnen", crop: { desktop: "4:5", mobile: "4:5", focus: { x: 50, y: 50 } }, asset: null },
    { id: "tresen", subject: "raum", role: "stimmung", motif: "Der Tresen am Morgen mit Filtern, Kuchenblech und Holzwand", alt: "Tresen der Rösterei am Morgen", crop: { desktop: "4:5", mobile: "4:5", focus: { x: 50, y: 50 } }, asset: null },
    { id: "datschi", subject: "gericht", role: "beweis", motif: "Zwetschgendatschi auf dem Blech, ein Stück herausgeschnitten", dish: "Kuchen vom Blech", alt: "Zwetschgendatschi auf dem Backblech", crop: { desktop: "4:5", mobile: "4:5", focus: { x: 50, y: 50 } }, asset: null },
  ],
});
