import { defineShowcase, week } from "../define";

export const kellerstubeEichhorn = defineShowcase({
  slug: "kellerstube-eichhorn",
  direction: "kellerstube-kupfer",
  facts: {
    name: "Kellerstube Eichhorn",
    locality: "Weidenstett",
    cuisine: "deutsch",
    address: { street: "Marktplatz 1", postalCode: "00913", locality: "Weidenstett" },
    phone: "089 99998 113",
    conceptShort: "Deutsche Küche im Gewölbekeller unter dem Marktplatz: fünf Gänge am Abend, oder drei, oder einer.",
    story:
      "Der Keller unter dem alten Rathaus wurde 1712 gemauert und diente zweihundert Jahre als Weinlager. Clara Eichhorn hat ihn 2020 mit ihrem Partner Felix Roth zur Kellerstube gemacht. Sie kocht, was die Höfe rund um Weidenstett bringen: im Herbst Wild und Kürbis, im Frühjahr Lamm und Bärlauch. Die Weine kommen von Winzern, die Felix selbst besucht hat.",
    usp: "Fünf Gänge oder à la carte, jeder Gang auch einzeln – und zu jedem ein Wein von einem Winzer, den Felix kennt.",
    signatureDishes: ["Rehrücken mit Sellerie und Wacholder", "Saibling mit Beurre blanc", "Dampfnudel mit Birne"],
    menu: {
      sections: [
        { title: "Zum Beginn", items: [{ name: "Kürbis, geröstet, mit Kernöl und Ziegenfrischkäse", priceCents: 1400, dietary: ["vegetarisch"], allergens: ["milch"] }] },
        { title: "Aus dem Wasser", items: [{ name: "Saibling mit Beurre blanc und Lauch", priceCents: 1900, allergens: ["fisch", "milch", "sulfite"] }] },
        { title: "Zwischengang", items: [{ name: "Pilzconsommé mit Grießnocke", priceCents: 1100, dietary: ["vegetarisch"], allergens: ["gluten", "eier", "sellerie"] }] },
        { title: "Vom Hof", items: [{ name: "Rehrücken mit Sellerie, Wacholder und Preiselbeere", priceCents: 3400, allergens: ["milch", "sellerie", "sulfite"] }] },
        { title: "Zum Schluss", items: [{ name: "Dampfnudel mit Birne und Vanille", priceCents: 1200, dietary: ["vegetarisch"], allergens: ["gluten", "eier", "milch"] }] },
      ],
      note: "Alle fünf Gänge 89 Euro, mit Weinbegleitung 139 Euro. Jeder Gang ist auch einzeln zu haben.",
    },
    openingHours: week({ mi: "18:00-23:00", do: "18:00-23:00", fr: "18:00-23:30", sa: "18:00-23:30" }, "Das Menü beginnt bis 20:30 Uhr."),
    serviceNotes: ["Der Keller hat 34 Plätze; für das Menü bitte anfragen.", "Nicht barrierefrei: Zum Keller führen 19 Stufen."],
    requestChannels: { table: true, pickup: false },
    primaryAction: "tableRequest",
    priceLevel: "upscale",
  },
  creative: {
    idea: "Die Kellerstube als Kupferlicht im Gewölbe: dunkel, warm, die Gänge wie Stationen einer Treppe hinab.",
    effect: "Man spürt in drei Sekunden: ein Abend, fünf Gänge, einen Tisch anfragen.",
    metaphor: "Kupferlampen an einem Ziegelgewölbe, die Karte in Kapiteln wie eine gebundene Weinkarte.",
    dramaturgy: [
      { section: "hero", weight: "gross", why: "Dunkelheit und eine große Schrift tragen den Keller." },
      { section: "story", weight: "gross", title: "Seit 1712 gemauert", why: "Das Gewölbe und die Höfe sind die Geschichte; beides steht vor der Karte." },
      { section: "menu", weight: "gross", title: "Fünf Gänge, oder einer", why: "Die Gänge folgen aufeinander wie Kapitel – die Ziffer führt durch den Abend." },
      { section: "signatureDishes", weight: "normal", title: "Was bleibt, wenn die Saison wechselt", why: "Drei Gerichte kommen jedes Jahr wieder." },
      { section: "imageSlots", weight: "normal", title: "Gewölbe, Teller, Keller", why: "Der Raum ist das Erlebnis; er braucht ein eigenes Foto." },
      { section: "request", weight: "gross", title: "Einen Abend im Keller anfragen", why: "34 Plätze: Ohne Anfrage ist der Abend meist voll." },
      { section: "hours", weight: "klein", title: "Mittwoch bis Samstag, ab 18 Uhr", why: "Nur abends." },
      { section: "serviceNotes", weight: "klein", title: "Plätze und Stufen", why: "Die Treppe ehrlich nennen." },
      { section: "visit", weight: "normal", title: "Unter dem alten Rathaus", why: "Den Eingang findet man nur, wenn man ihn kennt." },
    ],
    signatures: [
      { title: "Gänge als Kapitel", description: "Die fünf Gänge stehen mit großen Ziffern in Kupfer wie Kapitel einer gebundenen Karte.", evidence: ["menu"] },
      { title: "Geschichte vor der Karte", description: "Das Gewölbe steht mit seinem Baujahr als Überschrift direkt nach dem Namen.", evidence: ["story"] },
    ],
    omissions: ["Keine Fachwerk- oder Kerzen-Stockfotos", "Kein Fine-Dining-Englisch", "Keine goldenen Rahmen"],
  },
  imageSlots: [
    { id: "gewoelbe", subject: "raum", role: "stimmung", motif: "Das Ziegelgewölbe mit gedeckten Tischen und Kupferlampen", alt: "Gewölbekeller der Kellerstube mit gedeckten Tischen", crop: { desktop: "3:2", mobile: "4:5", focus: { x: 50, y: 50 } }, asset: null },
    { id: "rehruecken", subject: "gericht", role: "beweis", motif: "Rehrücken mit Sellerie auf dem dunklen Teller, seitlich fotografiert", dish: "Rehrücken mit Sellerie, Wacholder und Preiselbeere", alt: "Rehrücken mit Sellerie und Preiselbeere", crop: { desktop: "4:5", mobile: "4:5", focus: { x: 50, y: 50 } }, asset: null },
    { id: "treppe", subject: "haus", role: "orientierung", motif: "Die Kellertreppe vom Marktplatz aus, mit der Tür am Fuß", alt: "Treppe hinab zur Kellerstube vom Marktplatz aus", crop: { desktop: "4:5", mobile: "4:5", focus: { x: 50, y: 50 } }, asset: null },
  ],
});
