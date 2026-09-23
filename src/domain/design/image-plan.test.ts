import { describe, expect, it } from "vitest";

import { type ImageSlot, imageSlotSchema, resolveImageSlot } from "./image-plan";

const slot = (overrides: Partial<ImageSlot>): ImageSlot =>
  imageSlotSchema.parse({
    id: "tresen",
    subject: "raum",
    role: "stimmung",
    motif: "Der Tresen am frühen Abend, warmes Licht, Menschen unscharf",
    alt: "Holztresen mit Zapfhähnen im Abendlicht",
    crop: { desktop: "16:9", mobile: "4:5", focus: { x: 50, y: 40 } },
    asset: null,
    ...overrides,
  });

const asset = (overrides: Record<string, unknown>) => ({ src: "/bilder/tresen.avif", origin: "eigen", rights: "Eigenes Foto des Betriebs", approved: true, ...overrides });

describe("resolveImageSlot", () => {
  it("zeigt einen Bildplatz mit Motiv, solange kein Foto da ist", () => {
    expect(resolveImageSlot(slot({}))).toMatchObject({ show: "slot", reason: "Noch kein Foto" });
  });

  it("zeigt eigene, freigegebene Fotos", () => {
    expect(resolveImageSlot(slot({ asset: asset({}) as ImageSlot["asset"] })).show).toBe("image");
  });

  it.each([
    [{ approved: false }, "freigegeben"],
    [{ src: "https://images.unsplash.com/photo-1" }, "Hotlinks"],
    [{ origin: "stock" }, "S10"],
    [{ origin: "ki" }, "S10"],
  ])("lehnt %o für Raumfotos ab", (overrides, reason) => {
    const outcome = resolveImageSlot(slot({ asset: asset(overrides) as ImageSlot["asset"] }));
    expect(outcome.show).toBe("slot");
    expect(outcome.show === "slot" && outcome.reason).toContain(reason);
  });

  it("nimmt Stock für Gerichte nur, wenn es das genannte Gericht zeigt – KI nie", () => {
    const dish = { subject: "gericht" as const, dish: "Käsespätzle" };
    expect(resolveImageSlot(slot({ ...dish, asset: asset({ origin: "stock", showsDish: "Käsespätzle" }) as ImageSlot["asset"] })).show).toBe("image");
    expect(resolveImageSlot(slot({ ...dish, asset: asset({ origin: "stock", showsDish: "Spinatknödel" }) as ImageSlot["asset"] })).show).toBe("slot");
    expect(resolveImageSlot(slot({ ...dish, asset: asset({ origin: "ki" }) as ImageSlot["asset"] })).show).toBe("slot");
  });
});
