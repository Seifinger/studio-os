import { defineShowcase, week } from "../define";

export const izakayaTomo = defineShowcase({
  slug: "izakaya-tomo",
  direction: "izakaya-laterne",
  facts: {
    name: "Izakaya Tomo",
    locality: "Brunnhausen",
    cuisine: "japanisch",
    address: { street: "Schmiedgasse 8", postalCode: "00159", locality: "Brunnhausen" },
    phone: "089 99998 109",
    conceptShort: "Izakaya mit zwölf Plätzen an der Theke: kleine Teller vom Holzkohlegrill, dazu Sake aus kleinen Brauereien.",
    story:
      "Tomoko Aoki hat in Osaka in der Izakaya ihres Onkels gearbeitet, bevor sie nach Brunnhausen kam. 2022 hat sie die alte Schmiede in der Schmiedgasse ausgebaut: eine lange Theke aus Eiche, dahinter der Binchotan-Grill. Gekocht wird, was zum Sake passt – kleine Teller, die man nacheinander bestellt.",
    usp: "Zwölf Plätze an der Theke und ein Grill mit Binchotan-Kohle, die ohne Rauch brennt.",
    specials: ["Heute: Makrele vom Grill mit Rettich", "Sake der Woche: Junmai aus Niigata"],
    signatureDishes: ["Yakitori vom Binchotan", "Agedashi-Tofu", "Onigiri mit gegrilltem Lachs"],
    menu: {
      sections: [
        {
          title: "Vom Grill",
          items: [
            { name: "Hähnchenschenkel mit Lauch", description: "Tare oder Salz", priceCents: 450, allergens: ["soja", "gluten"] },
            { name: "Hähnchenherzen", priceCents: 400, allergens: ["soja", "gluten"] },
            { name: "Shiitake", description: "Butter, Sojasoße", priceCents: 450, dietary: ["vegetarisch"], allergens: ["milch", "soja", "gluten"] },
            { name: "Makrele", description: "halber Fisch, Rettich", priceCents: 1400, allergens: ["fisch"] },
          ],
        },
        {
          title: "Kleine Teller",
          items: [
            { name: "Agedashi-Tofu", description: "Dashi, Frühlingszwiebel", priceCents: 800, allergens: ["soja", "fisch", "gluten"] },
            { name: "Karaage", description: "frittierte Hähnchenkeule, Zitrone", priceCents: 900, allergens: ["gluten", "soja", "eier"] },
            { name: "Gurken in Sesam", priceCents: 500, dietary: ["vegan"], allergens: ["sesam", "soja"] },
          ],
        },
        {
          title: "Zum Schluss",
          items: [
            { name: "Onigiri mit gegrilltem Lachs", priceCents: 550, allergens: ["fisch", "sesam"] },
            { name: "Ochazuke", description: "Reis, grüner Tee, Nori", priceCents: 750, dietary: ["vegan"], allergens: ["soja"] },
          ],
        },
      ],
      note: "Zwei bis drei Spieße und zwei kleine Teller pro Person sind ein guter Anfang.",
    },
    openingHours: week({ mi: "18:00-23:30", do: "18:00-23:30", fr: "18:00-00:30", sa: "18:00-00:30" }, "Letzte Bestellung vom Grill um 22:30 Uhr."),
    serviceNotes: ["Zwölf Plätze an der Theke, zwei Tische für vier – bitte anfragen.", "Plätze werden für zwei Stunden vergeben.", "Keine Speisen zum Mitnehmen."],
    requestChannels: { table: true, pickup: false },
    primaryAction: "tableRequest",
    priceLevel: "mid",
  },
  creative: {
    idea: "Die Izakaya als Laterne über der Tür: dunkel, schmal, ein rotes Signal – drinnen die Theke.",
    effect: "Man versteht sofort, dass es wenige Plätze gibt und man anfragen sollte.",
    metaphor: "Eine Papierlaterne vor dunklem Holz, die Karte wie kleine Holztafeln über der Theke.",
    dramaturgy: [
      { section: "hero", weight: "gross", why: "Schmale, hohe Schrift wie auf der Laterne; der Name füllt die Nacht." },
      { section: "menu", weight: "gross", title: "Kleine Teller zum Sake", why: "Die Karte als kleine Tafeln – man bestellt nacheinander, nicht auf einmal." },
      { section: "specials", weight: "normal", title: "Heute über der Theke", why: "Fisch und Sake wechseln; das gehört gleich hinter die Karte." },
      { section: "request", weight: "gross", title: "Einen Platz an der Theke anfragen", why: "Zwölf Plätze: Ohne Anfrage kommt man freitags nicht hinein." },
      { section: "serviceNotes", weight: "normal", title: "Zwölf Plätze, zwei Stunden", why: "Die Regeln der Theke gehören direkt zur Anfrage." },
      { section: "story", weight: "normal", title: "Von Osaka in die alte Schmiede", why: "Wer hier kocht und warum Binchotan, erklärt sich in vier Sätzen." },
      { section: "hours", weight: "klein", title: "Mittwoch bis Samstag, ab 18 Uhr", why: "Nur abends – kurz setzen." },
      { section: "visit", weight: "normal", title: "Schmiedgasse 8", why: "Die Tür ist klein; Adresse genügt." },
    ],
    signatures: [{ title: "Anfrage als Hauptweg", description: "Die Tischanfrage bekommt großes Gewicht und die Regeln der Theke direkt darunter.", evidence: ["serviceNotes"] }],
    omissions: ["Keine Kirschblüten, keine Wellen, kein Fuji", "Keine Pinselschrift, keine falschen Schriftzeichen", "Keine Galerie ohne eigene Fotos"],
  },
  imageSlots: [],
});
