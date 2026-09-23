import { defineShowcase, week } from "../define";

export const taverneThalassa = defineShowcase({
  slug: "taverne-thalassa",
  direction: "taverne-am-hafen",
  facts: {
    name: "Taverne Thalassa",
    locality: "Seewinkel",
    cuisine: "griechisch",
    address: { street: "Am Steg 2", postalCode: "00582", locality: "Seewinkel" },
    phone: "089 99998 103",
    conceptShort: "Griechische Taverne am Bootssteg: Meze zum Teilen und Fisch, den der Fischer morgens bringt.",
    story:
      "Nikos und Eleni Stavrou haben die Taverne 2011 im alten Bootshaus am Steg eröffnet. Nikos kommt aus Kavala, einer Hafenstadt, und hat dort bei seinem Onkel am Grill gestanden. Renke und Saibling holt er jeden Morgen beim Fischer zwei Stege weiter; was aus dem See kommt, landet auf dem Holzkohlegrill. Von Mai bis September wird auf der Terrasse über dem Wasser gegessen.",
    usp: "Fisch aus dem See, gegrillt wie in Kavala – und Meze, von denen zwei Personen vier bis fünf teilen.",
    specials: ["Tagesfang: Renke vom Grill mit Zitronenkartoffeln", "Saibling in Weinblättern mit Fava", "Dazu vom Fass: Assyrtiko aus Santorin"],
    signatureDishes: ["Renke vom Holzkohlegrill", "Fava mit Kapern und roten Zwiebeln", "Galaktoboureko"],
    menu: {
      sections: [
        {
          title: "Kalte Meze",
          items: [
            { name: "Fava", description: "Platterbsenpüree, Kapern, rote Zwiebeln", priceCents: 750, dietary: ["vegan"], allergens: [] },
            { name: "Taramas", description: "Fischrogencreme, Olivenöl, Zitrone", priceCents: 800, allergens: ["fisch", "gluten"] },
            { name: "Tzatziki", priceCents: 650, dietary: ["vegetarisch"], allergens: ["milch"] },
            { name: "Dakos", description: "Gerstenzwieback, Tomate, Myzithra", priceCents: 850, dietary: ["vegetarisch"], allergens: ["gluten", "milch"] },
          ],
        },
        {
          title: "Warme Meze",
          items: [
            { name: "Gegrillter Oktopus", description: "Essig, Oregano", priceCents: 1450, allergens: ["weichtiere"] },
            { name: "Saganaki", description: "gebratener Graviera, Honig, Sesam", priceCents: 950, dietary: ["vegetarisch"], allergens: ["milch", "sesam", "gluten"] },
            { name: "Keftedes", description: "Hackbällchen mit Minze", priceCents: 900, allergens: ["gluten", "eier"] },
            { name: "Gigantes", description: "Riesenbohnen aus dem Ofen", priceCents: 800, dietary: ["vegan"], allergens: ["sellerie"] },
          ],
        },
        {
          title: "Vom Grill",
          items: [
            { name: "Renke aus dem See", description: "ganzer Fisch, Zitronenkartoffeln, Horta", priceCents: 2300, allergens: ["fisch"] },
            { name: "Lammkoteletts", description: "Oregano, Pommes aus dem Ofen", priceCents: 2600, allergens: [] },
            { name: "Souvlaki vom Schwein", description: "Pita, Tomate, Zwiebel, Tzatziki", priceCents: 1700, allergens: ["gluten", "milch"] },
          ],
        },
        {
          title: "Süßes",
          items: [
            { name: "Galaktoboureko", description: "Grießcreme im Filoteig, Sirup", priceCents: 750, dietary: ["vegetarisch"], allergens: ["gluten", "eier", "milch"] },
            { name: "Joghurt mit Thymianhonig und Walnüssen", priceCents: 650, dietary: ["vegetarisch"], allergens: ["milch", "schalenfruechte"] },
          ],
        },
      ],
      note: "Fisch nach Tagesfang – wenn die Renke aus ist, sagt es Ihnen der Service.",
    },
    openingHours: week(
      { mi: "17:00-23:00", do: "17:00-23:00", fr: "17:00-23:00", sa: "12:00-23:00", so: "12:00-22:00" },
      "Küche bis 21:30 Uhr. Terrasse von Mai bis September.",
    ),
    serviceNotes: ["Terrassentische werden nicht reserviert – wer zuerst kommt, sitzt am Wasser.", "Für Gruppen ab acht Personen stellen wir eine Meze-Tafel zusammen."],
    requestChannels: { table: true, pickup: false },
    primaryAction: "call",
    priceLevel: "mid",
  },
  creative: {
    idea: "Die Taverne als Zettelwand am Steg: kleine Meze-Zettel mit Preis, der Tagesfang mit Kreide daneben.",
    effect: "Man sieht sofort, welcher Fisch heute kommt, und dass hier geteilt wird.",
    metaphor: "Kalkweiße Wand mit angehefteten Zetteln, Tiefseeblau wie der Anstrich der Fensterläden.",
    dramaturgy: [
      { section: "hero", weight: "gross", why: "Der Tagesfang steht neben dem Namen – er ist der Grund für den Anruf." },
      { section: "menu", weight: "gross", title: "Meze zum Teilen, Fisch vom Grill", why: "Die Meze sind klein und zahlreich; als Zettel mit Preis lassen sie sich schnell zusammenstellen." },
      { section: "story", weight: "normal", title: "Aus Kavala ans Bootshaus", why: "Hafenstadt und See erklären, warum hier Fisch vom Grill kommt." },
      { section: "imageSlots", weight: "normal", title: "Steg, Grill, Terrasse", why: "Der Ort am Wasser trägt die Stimmung – er braucht Fotos, keine Worte." },
      { section: "hours", weight: "klein", title: "Mittwoch bis Sonntag", why: "Abends geöffnet, am Wochenende auch mittags – knapp gesetzt." },
      { section: "serviceNotes", weight: "klein", title: "Terrasse und Gruppen", why: "Die Terrasse ist das Erste, wonach am Telefon gefragt wird." },
      { section: "request", weight: "normal", why: "Wer nicht anrufen will, fragt einen Tisch drinnen schriftlich an." },
      { section: "visit", weight: "normal", title: "Am Steg, neben dem Bootsverleih", why: "Der Weg zum Wasser muss sofort klar sein." },
    ],
    signatures: [{ title: "Tagesfang neben dem Namen", description: "Der Tagesfang steht im Kopf der Seite auf einem Zettel wie die Kreidetafel am Steg.", evidence: ["specials"] }],
    omissions: ["Kein Mäander, keine Säulen, kein Blau-Weiß-Streifen", "Keine Stockfotos von Santorini", "Kein Sirtaki-Vokabular"],
  },
  imageSlots: [
    { id: "steg", subject: "umgebung", role: "orientierung", motif: "Das Bootshaus vom Steg aus gesehen, Terrasse über dem Wasser am frühen Abend", alt: "Bootshaus der Taverne Thalassa mit Terrasse über dem See", crop: { desktop: "3:2", mobile: "4:5", focus: { x: 50, y: 50 } }, asset: null },
    { id: "grill", subject: "team", role: "beweis", motif: "Nikos am Holzkohlegrill mit zwei Renken auf dem Rost", alt: "Nikos Stavrou grillt Renken über Holzkohle", crop: { desktop: "4:5", mobile: "4:5", focus: { x: 50, y: 45 } }, asset: null },
    { id: "meze", subject: "gericht", role: "beweis", motif: "Vier Meze auf dem Holztisch von oben: Fava, Taramas, Tzatziki, Oktopus", dish: "Fava", alt: "Fava, Taramas, Tzatziki und Oktopus auf einem Holztisch", crop: { desktop: "1:1", mobile: "1:1", focus: { x: 50, y: 50 } }, asset: null },
  ],
});
