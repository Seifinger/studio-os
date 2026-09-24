import { defineShowcase, week } from "../define";

export const nudelbarAmKanal = defineShowcase({
  slug: "nudelbar-am-kanal",
  direction: "nudelbar-marktstand",
  facts: {
    name: "Nudelbar am Kanal",
    locality: "Aubrunn",
    cuisine: "asiatisch",
    address: { street: "Kanalweg 11", postalCode: "00318", locality: "Aubrunn" },
    phone: "089 99998 111",
    conceptShort: "Nudelbar mit acht Schalen aus vier Ländern – Ramen, Udon, Dan Dan und Laksa – an einer Theke am Kanal.",
    story:
      "Kim Nguyen und Daniel Brandl haben sich in einer Großküche kennengelernt und 2023 die Nudelbar im ehemaligen Kiosk am Kanalweg eröffnet. Die Nudeln kommen von einer kleinen Manufaktur, die Brühen kochen sie selbst: Schwein für Ramen, Dashi für Udon, Kokos für Laksa.",
    usp: "Acht Schalen, vier Brühen, alle selbst gekocht – und jede Schale auch vegan.",
    specials: ["Neu: Laksa mit Garnelen und Tofu-Puffs", "Im Sommer: kalte Soba mit Sesamsoße"],
    signatureDishes: ["Tonkotsu-Ramen", "Dan-Dan-Nudeln", "Curry-Udon"],
    menu: {
      sections: [
        {
          title: "Brühe",
          items: [
            { name: "Tonkotsu-Ramen", description: "Schweinebrühe, Chashu, Ei", priceCents: 1450, allergens: ["gluten", "eier", "soja", "sesam"] },
            { name: "Shoyu-Ramen vegan", description: "Pilzbrühe, Tofu, Mais", priceCents: 1350, dietary: ["vegan"], allergens: ["gluten", "soja"] },
            { name: "Laksa", description: "Kokos, Curry, Garnelen, Tofu", priceCents: 1500, dietary: ["scharf"], allergens: ["krebstiere", "soja", "fisch"] },
            { name: "Kitsune-Udon", description: "Dashi, süßer Tofu, Lauch", priceCents: 1250, allergens: ["gluten", "soja", "fisch"] },
          ],
        },
        {
          title: "Ohne Brühe",
          items: [
            { name: "Dan-Dan-Nudeln", description: "Sesam, Chiliöl, Schweinehack", priceCents: 1300, dietary: ["scharf"], allergens: ["gluten", "sesam", "soja", "erdnuesse"] },
            { name: "Curry-Udon", description: "japanisches Curry, Kartoffel", priceCents: 1300, dietary: ["vegetarisch"], allergens: ["gluten", "sellerie", "soja"] },
            { name: "Yaki-Soba", description: "Kohl, Ingwer, Bonito", priceCents: 1250, allergens: ["gluten", "soja", "fisch"] },
          ],
        },
        {
          title: "Dazu",
          items: [
            { name: "Gyoza", description: "sechs Stück, Schwein oder Gemüse", priceCents: 700, allergens: ["gluten", "soja", "sesam"] },
            { name: "Marinierte Eier", priceCents: 250, dietary: ["vegetarisch"], allergens: ["eier", "soja"] },
          ],
        },
      ],
      note: "Jede Schale gibt es auch vegan – bitte beim Bestellen sagen.",
    },
    openingHours: week({ mi: "11:30-21:00", do: "11:30-21:00", fr: "11:30-22:00", sa: "12:00-22:00", so: "12:00-20:00" }),
    serviceNotes: ["Am Kanal stehen im Sommer vier Tische draußen.", "Abholung am Kioskfenster, Schalen mit Pfand."],
    requestChannels: { table: false, pickup: true },
    primaryAction: "pickupRequest",
    priceLevel: "budget",
  },
  creative: {
    idea: "Die Nudelbar als Marktstand: eine laute Zeile, schwarz auf hellem Papier, Orange als einziges Signal.",
    effect: "Man sieht acht Schalen, versteht die Auswahl sofort und kann in zwei Klicks vorbestellen.",
    metaphor: "Handgeschriebene Preisschilder an einem Marktstand, die Karte als Stapel kleiner Zettel.",
    dramaturgy: [
      { section: "hero", weight: "gross", why: "Der Name ist Ortsangabe und Programm zugleich." },
      { section: "menu", weight: "gross", title: "Acht Schalen, vier Brühen", why: "Die Auswahl passt auf Zettel; man vergleicht schneller nebeneinander." },
      { section: "specials", weight: "normal", title: "Neu am Kanal", why: "Neue Schalen wechseln oft – eigene Tafel." },
      { section: "request", weight: "gross", title: "Vorbestellen, am Fenster abholen", why: "Die meisten Gäste nehmen mit." },
      { section: "imageSlots", weight: "normal", title: "Fenster, Schale, Kanal", why: "Der kleine Kiosk am Wasser braucht ein echtes Foto." },
      { section: "hours", weight: "normal", title: "Mittwoch bis Sonntag", why: "Mittags durchgehend – klar sagen." },
      { section: "story", weight: "klein", title: "Ein Kiosk am Kanalweg", why: "Kurz, weil die Schalen für sich sprechen." },
      { section: "serviceNotes", weight: "klein", title: "Draußen und Pfand", why: "Pfand und Außenplätze sind die häufigsten Fragen." },
      { section: "visit", weight: "normal", title: "Kanalweg 11", why: "Der Kiosk ist klein; Adresse genügt." },
    ],
    signatures: [],
    omissions: ["Keine Stäbchen-Icons, keine Schalen-Illustrationen", "Keine Mischung aus vier Länder-Klischees", "Keine Schriftzeichen als Dekoration"],
  },
  imageSlots: [
    { id: "kiosk", subject: "haus", role: "orientierung", motif: "Der Kiosk am Kanalweg mit offenem Abholfenster", alt: "Kiosk der Nudelbar am Kanalweg mit Abholfenster", crop: { desktop: "3:2", mobile: "4:5", focus: { x: 50, y: 50 } }, asset: null },
    { id: "ramen", subject: "gericht", role: "beweis", motif: "Tonkotsu-Ramen von oben auf der Theke", dish: "Tonkotsu-Ramen", alt: "Tonkotsu-Ramen mit Chashu und Ei", crop: { desktop: "1:1", mobile: "1:1", focus: { x: 50, y: 50 } }, asset: null },
    { id: "theke", subject: "raum", role: "stimmung", motif: "Die Theke am Mittag, Gäste auf Hockern, Blick durchs Fenster auf den Kanal", alt: "Theke der Nudelbar mit Blick auf den Kanal", crop: { desktop: "4:5", mobile: "4:5", focus: { x: 50, y: 50 } }, asset: null },
  ],
});
