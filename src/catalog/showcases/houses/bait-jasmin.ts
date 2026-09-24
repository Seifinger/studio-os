import { defineShowcase, week } from "../define";

export const baitJasmin = defineShowcase({
  slug: "bait-jasmin",
  direction: "damaszener-hof",
  facts: {
    name: "Bait Jasmin",
    locality: "Kirchlingen",
    cuisine: "syrisch",
    address: { street: "Hofgasse 9", postalCode: "00236", locality: "Kirchlingen" },
    phone: "089 99998 105",
    conceptShort: "Syrische Küche in einem Innenhof: Mezze zum Teilen, Freitag und Samstag die Gerichte, die zu Hause sonntags auf den Tisch kamen.",
    story:
      "Rima und Samer Haddad haben in Damaskus ein Restaurant im Hof ihres Hauses geführt, bis sie 2015 fliehen mussten. In Kirchlingen haben sie 2019 wieder einen Hof gefunden, hinter der alten Druckerei in der Hofgasse. Rima kocht nach den Rezepten ihrer Mutter; Samer backt das Brot und erklärt jedem Gast gern, was auf dem Teller liegt. Der Jasmin am Brunnen stammt aus einem Ableger, den eine Nachbarin aus Aleppo mitgebracht hat.",
    usp: "Jeden Freitag und Samstag ein Schmorgericht aus Damaskus, das sonst kaum ein Restaurant kocht.",
    specials: ["Freitag: Kibbeh bil-sanieh aus dem Ofen", "Samstag: Maqluba mit Aubergine und Lamm", "Dazu: Ayran aus eigenem Joghurt"],
    signatureDishes: ["Muhammara mit Walnuss", "Fatteh mit Kichererbsen", "Maqluba am Samstag"],
    menu: {
      sections: [
        {
          title: "Mezze",
          items: [
            { name: "Hummus", description: "mit warmen Kichererbsen und Olivenöl", priceCents: 700, dietary: ["vegan"], allergens: ["sesam"] },
            { name: "Muhammara", description: "Paprika, Walnuss, Granatapfel", priceCents: 750, dietary: ["vegan"], allergens: ["schalenfruechte", "gluten"] },
            { name: "Baba Ghanoush", description: "Aubergine vom Feuer, Sesam", priceCents: 700, dietary: ["vegan"], allergens: ["sesam"] },
            { name: "Fattoush", description: "Salat, geröstetes Brot, Sumach", priceCents: 800, dietary: ["vegan"], allergens: ["gluten"] },
            { name: "Fatteh", description: "Kichererbsen, Joghurt, Pinienkerne, Brot", priceCents: 900, dietary: ["vegetarisch"], allergens: ["gluten", "milch", "sesam"] },
          ],
        },
        {
          title: "Warmes",
          items: [
            { name: "Kibbeh", description: "Bulgur und Lamm, gefüllt mit Pinienkernen", priceCents: 950, allergens: ["gluten"] },
            { name: "Shish Taouk", description: "Hähnchen, Knoblauchcreme, Brot", priceCents: 1700, allergens: ["gluten", "eier", "senf"] },
            { name: "Mujaddara", description: "Linsen, Reis, geschmorte Zwiebeln", priceCents: 1400, dietary: ["vegan"], allergens: [] },
          ],
        },
        {
          title: "Süßes",
          items: [
            { name: "Mahalabiya", description: "Milchpudding mit Rosenwasser und Pistazie", priceCents: 650, dietary: ["vegetarisch"], allergens: ["milch", "schalenfruechte"] },
            { name: "Baklava vom Blech", priceCents: 600, dietary: ["vegetarisch"], allergens: ["gluten", "milch", "schalenfruechte"] },
          ],
        },
      ],
      note: "Zu zweit reichen fünf Mezze und ein warmes Gericht. Das Brot backen wir selbst.",
    },
    openingHours: week({ mi: "17:30-22:30", do: "17:30-22:30", fr: "17:30-23:00", sa: "12:00-23:00", so: "12:00-21:00" }, "Im Sommer sitzen Sie im Hof am Brunnen."),
    serviceNotes: ["Für das Schmorgericht am Wochenende bitte reservieren – es gibt jeweils nur einen Topf.", "Alle Mezze sind auf Wunsch ohne Nüsse zu haben."],
    requestChannels: { table: true, pickup: false },
    primaryAction: "tableRequest",
    priceLevel: "mid",
  },
  creative: {
    idea: "Bait Jasmin erzählt zuerst, wessen Hof das ist – dann, was auf den Tisch kommt.",
    effect: "Man versteht in wenigen Sekunden, dass hier eine Familie aus Damaskus kocht, und sieht das Wochenendgericht.",
    metaphor: "Petrolfarbene Kacheln am Brunnen, cremefarbener Putz, Mezze wie kleine Teller auf dem Hoftisch.",
    dramaturgy: [
      { section: "hero", weight: "gross", why: "Name und Wochenendgericht zuerst; die Tafel daneben ist der Grund zu reservieren." },
      { section: "story", weight: "gross", title: "Von einem Hof in Damaskus in die Hofgasse", why: "Die Geschichte ist der Kern des Hauses und steht deshalb vor der Karte." },
      { section: "menu", weight: "gross", title: "Mezze zum Teilen", why: "Kleine Teller als Karten, damit man fünf auf einmal auswählen kann." },
      { section: "imageSlots", weight: "normal", title: "Hof, Brunnen, Brot", why: "Der Hof ist der Raum des Hauses; ohne Foto bleibt er eine Behauptung." },
      { section: "hours", weight: "klein", title: "Mittwoch bis Sonntag", why: "Kurz und klar." },
      { section: "request", weight: "normal", title: "Einen Tisch im Hof anfragen", why: "Das Wochenendgericht reicht nur für einen Topf – Reservierungen helfen der Küche." },
      { section: "serviceNotes", weight: "klein", title: "Gut zu wissen", why: "Nüsse und Wochenendtopf sind die häufigsten Fragen." },
      { section: "visit", weight: "normal", title: "Hinter der alten Druckerei", why: "Der Hof liegt versteckt; der Weg muss beschrieben werden." },
    ],
    signatures: [{ title: "Geschichte vor der Karte", description: "Die Geschichte der Familie steht groß direkt nach dem Hero, mit dem ersten Satz als Einleitung.", evidence: ["story"] }],
    omissions: ["Keine Laternen- oder Wüstenmotive", "Keine Arabesken als Hintergrund", "Kein Wort über Flucht als Verkaufsargument außerhalb der Geschichte"],
  },
  imageSlots: [
    { id: "hof", subject: "raum", role: "stimmung", motif: "Der Innenhof am Abend: Brunnen mit Kacheln, Jasmin, gedeckte Tische", alt: "Innenhof von Bait Jasmin mit Brunnen und gedeckten Tischen", crop: { desktop: "3:2", mobile: "4:5", focus: { x: 50, y: 55 } }, asset: null },
    { id: "brot", subject: "team", role: "beweis", motif: "Samer nimmt Fladenbrot aus dem Ofen", alt: "Samer Haddad nimmt Fladenbrot aus dem Ofen", crop: { desktop: "4:5", mobile: "4:5", focus: { x: 50, y: 40 } }, asset: null },
    { id: "mezze", subject: "gericht", role: "beweis", motif: "Fünf Mezze auf dem Hoftisch von oben, mit Brot in der Mitte", dish: "Muhammara", alt: "Muhammara, Hummus, Fattoush und weitere Mezze auf einem Tisch", crop: { desktop: "1:1", mobile: "1:1", focus: { x: 50, y: 50 } }, asset: null },
  ],
});
