import { defineShowcase, week } from "../define";

export const nudelhausJin = defineShowcase({
  slug: "nudelhaus-jin",
  direction: "nudelhaus-nacht",
  facts: {
    name: "Nudelhaus Jin",
    locality: "Hollerau",
    cuisine: "chinesisch",
    address: { street: "Lange Zeile 40", postalCode: "00795", locality: "Hollerau" },
    phone: "089 99998 106",
    conceptShort: "Nudeln, von Hand gezogen, nach Art von Lanzhou – bis Mitternacht, am Tresen vor der offenen Küche.",
    story:
      "Jin Wei hat in Lanzhou gelernt, Nudelteig mit den Händen zu ziehen, bis er so dünn ist wie ein Faden. Seit 2020 macht er das in Hollerau hinter einer Glasscheibe, sodass jeder Gast zusehen kann. Die Rinderbrühe kocht über Nacht. Wer spät aus dem Theater oder von der Schicht kommt, bekommt hier bis Mitternacht eine Schale.",
    usp: "Jede Schale wird erst gezogen, wenn sie bestellt ist – sieben Stärken, vom Faden bis zum breiten Band.",
    signatureDishes: ["Lanzhou-Rindernudelsuppe", "Biang-Biang-Nudeln mit Chiliöl", "Gurken mit schwarzem Essig"],
    menu: {
      sections: [
        {
          title: "Kalte Teller",
          items: [
            { name: "Geschlagene Gurken", description: "schwarzer Essig, Knoblauch", priceCents: 550, dietary: ["vegan"], allergens: ["soja", "gluten"] },
            { name: "Rindfleisch in Chiliöl", description: "Sichuanpfeffer, Koriander", priceCents: 950, dietary: ["scharf"], allergens: ["soja", "sesam", "erdnuesse"] },
          ],
        },
        {
          title: "Nudeln aus der Hand",
          note: "Nudelstärke bitte beim Bestellen sagen: fein, mittel, breit.",
          items: [
            { name: "Lanzhou-Rindernudelsuppe", description: "Brühe über Nacht, Rettich, Chiliöl", priceCents: 1450, allergens: ["gluten", "sellerie", "soja"] },
            { name: "Biang-Biang-Nudeln", description: "breit, mit heißem Chiliöl übergossen", priceCents: 1350, dietary: ["vegan", "scharf"], allergens: ["gluten", "soja", "sesam"] },
            { name: "Nudeln mit Tomate und Ei", priceCents: 1200, dietary: ["vegetarisch"], allergens: ["gluten", "eier"] },
            { name: "Zhajiang-Nudeln", description: "Schweinehack, Sojabohnenpaste", priceCents: 1400, allergens: ["gluten", "soja"] },
          ],
        },
        {
          title: "Aus dem Wok",
          items: [
            { name: "Kung-Pao-Hähnchen", priceCents: 1550, dietary: ["scharf"], allergens: ["erdnuesse", "soja", "gluten"] },
            { name: "Aubergine mit Knoblauch", priceCents: 1300, dietary: ["vegan"], allergens: ["soja", "gluten"] },
          ],
        },
        {
          title: "Zum Schluss",
          items: [{ name: "Sesambällchen", description: "rote Bohnenpaste", priceCents: 550, dietary: ["vegan"], allergens: ["sesam", "gluten"] }],
        },
      ],
    },
    openingHours: week(
      { di: "17:00-00:00", mi: "17:00-00:00", do: "17:00-00:00", fr: "17:00-01:00", sa: "12:00-01:00", so: "12:00-22:00" },
      "Die Küche zieht bis eine halbe Stunde vor Schluss.",
    ),
    serviceNotes: ["Am Tresen vor der Glasscheibe ist Platz für zehn.", "Nudeln zum Mitnehmen nur als Wok-Gericht – Suppe gehört in die Schale."],
    requestChannels: { table: true, pickup: true },
    primaryAction: "call",
    priceLevel: "budget",
  },
  creative: {
    idea: "Das Nudelhaus als Leuchtschrift in der Nacht: ein Name, ein Rot, eine Schale.",
    effect: "Man sieht sofort: offen bis Mitternacht, handgezogene Nudeln, anrufen oder vorbeikommen.",
    metaphor: "Lackschwarzer Tresen, die Karte wie eine Bestellkarte in Gängen, Gold für die Ziffern.",
    dramaturgy: [
      { section: "hero", weight: "gross", why: "Der Name steht groß wie die Schrift über der Tür, bei Nacht." },
      { section: "signatureDishes", weight: "gross", title: "Von Hand gezogen", why: "Drei Schalen machen das Haus aus; sie stehen vor der Karte." },
      { section: "menu", weight: "gross", title: "Die Bestellkarte", why: "Gänge wie auf einer Bestellkarte, mit Nudelstärke als Hinweis." },
      { section: "hours", weight: "normal", title: "Bis Mitternacht, am Wochenende länger", why: "Die späten Zeiten sind das Versprechen des Hauses." },
      { section: "story", weight: "normal", title: "Lanzhou, hinter Glas", why: "Das Ziehen der Nudeln ist Handwerk, das man sehen kann." },
      { section: "request", weight: "normal", why: "Tische am Tresen oder Wok-Gerichte zum Mitnehmen anfragen." },
      { section: "serviceNotes", weight: "klein", title: "Tresen und Mitnahme", why: "Warum es Suppe nicht zum Mitnehmen gibt, erklärt sich in einem Satz." },
      { section: "visit", weight: "normal", title: "Lange Zeile 40", why: "Adresse und Nummer, mehr braucht die Nacht nicht." },
    ],
    signatures: [{ title: "Drei Schalen vor der Karte", description: "Die drei Hausgerichte stehen in großer Titelschrift direkt nach dem Namen.", evidence: ["signatureDishes"] }],
    omissions: ["Keine Drachen, keine Lampions, kein Gold-Rot-Kitsch", "Keine Fotos – die Galerie bleibt bewusst weg, bis es echte Bilder aus der Küche gibt", "Keine Asia-Schriften mit Pinselstrich"],
  },
  imageSlots: [],
});
