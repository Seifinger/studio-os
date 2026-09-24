import { defineShowcase, week } from "../define";

export const kramerwirt = defineShowcase({
  slug: "gasthaus-zum-kramerwirt",
  direction: "wirtshaus-stadtplatz",
  facts: {
    name: "Gasthaus Zum Kramerwirt",
    locality: "Kornbach",
    cuisine: "bayerisch",
    address: { street: "Stadtplatz 7", postalCode: "00471", locality: "Kornbach" },
    phone: "089 99998 101",
    conceptShort: "Wirtshaus am Stadtplatz: unter der Woche Mittagstisch, am Sonntag Braten aus dem Rohr.",
    story:
      "Den Kramerwirt gibt es seit 1908 am Stadtplatz von Kornbach. Theresa Kramer führt das Haus in vierter Generation und steht selbst am Herd, ihr Bruder Andreas kümmert sich um Gaststube und Bier. Das Fleisch kommt vom Metzger zwei Häuser weiter, das Helle aus der Brauerei am Ortsrand. Donnerstags ist Stammtisch, und sonntags riecht der ganze Platz nach Schweinsbraten.",
    usp: "Mittagstisch von Dienstag bis Freitag für 11,50 Euro, die Tagessuppe ist dabei.",
    specials: [
      "Dienstag: Kalbsrahmgulasch mit Butterspätzle",
      "Mittwoch: Krautwickerl mit Kartoffelpüree",
      "Donnerstag: Schweinsbraten mit Kartoffelknödel",
      "Freitag: Gebackener Seelachs mit Kartoffel-Gurken-Salat",
    ],
    signatureDishes: ["Schweinsbraten mit Dunkelbiersoße", "Kässpatzen mit Bergkäse", "Dampfnudel mit Vanillesoße"],
    menu: {
      sections: [
        {
          title: "Suppen",
          items: [
            { name: "Leberknödelsuppe", description: "Rinderbrühe, Schnittlauch", priceCents: 580, allergens: ["gluten", "eier", "sellerie"] },
            { name: "Kartoffelsuppe mit Majoran", description: "mit gerösteten Speckwürfeln", priceCents: 550, allergens: ["milch", "sellerie"] },
          ],
        },
        {
          title: "Vom Herd",
          items: [
            { name: "Schweinsbraten mit Dunkelbiersoße", description: "Kartoffelknödel, warmer Krautsalat", priceCents: 1690, allergens: ["gluten", "eier", "sellerie", "senf"] },
            { name: "Tafelspitz", description: "Bouillonkartoffeln, Apfelkren, Schnittlauchsoße", priceCents: 1950, allergens: ["eier", "milch", "sellerie", "senf"] },
            { name: "Ochsenbackerl in Rotwein", description: "Selleriepüree, glasierte Karotten", priceCents: 2100, allergens: ["milch", "sellerie", "sulfite"] },
            { name: "Kässpatzen mit Bergkäse", description: "Röstzwiebeln, grüner Salat", priceCents: 1380, dietary: ["vegetarisch"], allergens: ["gluten", "eier", "milch", "senf"] },
          ],
        },
        {
          title: "Brotzeit",
          note: "Bis 17 Uhr und nach 21 Uhr, wenn die warme Küche zu hat.",
          items: [
            { name: "Obazda mit Brezn", description: "Radieserl, rote Zwiebeln", priceCents: 920, dietary: ["vegetarisch"], allergens: ["gluten", "milch"] },
            { name: "Wurstsalat, sauer angemacht", description: "mit Bauernbrot", priceCents: 980, allergens: ["gluten", "senf", "sulfite"] },
          ],
        },
        {
          title: "Nachspeisen",
          items: [
            { name: "Dampfnudel mit Vanillesoße", priceCents: 750, dietary: ["vegetarisch"], allergens: ["gluten", "eier", "milch"] },
            { name: "Apfelkücherl mit Zimtzucker", priceCents: 690, dietary: ["vegetarisch"], allergens: ["gluten", "eier", "milch"] },
          ],
        },
      ],
      note: "Alle Preise in Euro inklusive Mehrwertsteuer. Zu Allergenen gibt die Küche gern genauer Auskunft.",
    },
    openingHours: week(
      { di: "11:30-14:00 17:30-23:00", mi: "11:30-14:00 17:30-23:00", do: "11:30-14:00 17:30-23:00", fr: "11:30-14:00 17:30-23:00", sa: "11:30-23:00", so: "11:30-21:00" },
      "Warme Küche bis 21:30 Uhr, sonntags bis 20:00 Uhr.",
    ),
    serviceNotes: [
      "Der runde Tisch am Fenster gehört donnerstags dem Stammtisch.",
      "Gruppen ab zehn Personen bitte telefonisch anfragen.",
      "Hunde dürfen mit in die Gaststube.",
    ],
    requestChannels: { table: true, pickup: false },
    primaryAction: "tableRequest",
    priceLevel: "mid",
  },
  creative: {
    idea: "Der Kramerwirt als Tafel neben der Wirtshaustür: Was es heute gibt, steht ganz vorn.",
    effect: "Nach drei Sekunden weiß man, dass hier mittags gekocht wird, was es heute gibt und wie man einen Tisch bekommt.",
    metaphor: "Die Mittagstafel neben der Tür, darunter die gedruckte Karte auf festem Papier mit Punktlinien bis zum Preis.",
    dramaturgy: [
      { section: "hero", weight: "gross", why: "Name und Mittagstafel zuerst – die meisten Gäste wollen wissen, was es heute gibt." },
      { section: "menu", weight: "gross", title: "Mittags wie abends dieselbe Karte", why: "Die Karte ist kurz und ändert sich selten; sie darf ruhig und vollständig gesetzt sein." },
      { section: "story", weight: "normal", title: "Seit 1908 am Stadtplatz", why: "Vier Generationen erklären, warum der Braten so schmeckt – kurz, ohne Chronik." },
      { section: "hours", weight: "normal", title: "Dienstag bis Sonntag", why: "Ruhetag und Küchenschluss sind die häufigste Frage am Telefon." },
      { section: "request", weight: "normal", title: "Einen Tisch in der Gaststube anfragen", why: "Die Anfrage ersetzt den Anruf zur Mittagszeit, wenn niemand ans Telefon kann." },
      { section: "imageSlots", weight: "klein", title: "Gaststube, Braten, Tafel", why: "Drei Fotos reichen: der Raum, das bekannteste Gericht und die Tafel selbst." },
      { section: "serviceNotes", weight: "klein", title: "Stammtisch, Gruppen, Hunde", why: "Hausregeln ersparen Rückfragen und zeigen, wie es im Haus zugeht." },
      { section: "visit", weight: "normal", title: "Am Stadtplatz, gegenüber der Kirche", why: "Wer den Platz kennt, findet das Haus; Adresse und Nummer müssen trotzdem sofort da sein." },
    ],
    signatures: [
      { title: "Mittagstafel neben dem Namen", description: "Der Mittagstisch der Woche steht im Kopf der Seite wie die Tafel neben der Tür.", evidence: ["specials"] },
      { title: "Karte mit Punktlinien", description: "Gerichte und Preise sind durch Punktlinien verbunden wie auf einer gedruckten Wirtshauskarte.", evidence: ["menu"] },
    ],
    omissions: ["Keine Rauten, keine Tracht, keine Bierkrug-Stockfotos", "Kein Bildslider", "Kein Reservierungssystem – Anfragen gehen direkt ans Haus"],
  },
  imageSlots: [
    {
      id: "gaststube",
      subject: "raum",
      role: "stimmung",
      motif: "Die Gaststube zur Mittagszeit, eingedeckte Tische, Licht vom Stadtplatz",
      alt: "Gaststube des Kramerwirts zur Mittagszeit",
      crop: { desktop: "3:2", mobile: "4:5", focus: { x: 50, y: 55 } },
      asset: null,
    },
    {
      id: "schweinsbraten",
      subject: "gericht",
      role: "beweis",
      motif: "Schweinsbraten mit Kruste, Knödel und Dunkelbiersoße auf dem Hausteller",
      dish: "Schweinsbraten mit Dunkelbiersoße",
      alt: "Schweinsbraten mit Kartoffelknödel und Dunkelbiersoße",
      crop: { desktop: "1:1", mobile: "1:1", focus: { x: 50, y: 50 } },
      asset: null,
    },
    {
      id: "mittagstafel",
      subject: "detail",
      role: "orientierung",
      motif: "Die Kreidetafel mit dem Mittagstisch neben der Eingangstür",
      alt: "Kreidetafel mit dem Mittagstisch der Woche",
      crop: { desktop: "4:5", mobile: "4:5", focus: { x: 50, y: 40 } },
      asset: null,
    },
  ],
});
