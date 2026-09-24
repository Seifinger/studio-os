import { expect, test } from "@playwright/test";

// Erste Seite im Basissystem narrative-editorial (ADR 0022): kontextuelle Handlungsleiste,
// reduzierte Bewegung, Tastatur für Galerie und Kartenkategorien.

const PAGE = "/beispiele/tiffinstube-rao";

test("Eingang: Name, beide Wege auf dem ersten Bildschirm, kein Überlauf", async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.getByRole("heading", { level: 1, name: "Tiffinstube Rao" })).toBeVisible();
  const hero = page.locator('[data-kind="hero"]');
  await expect(hero.getByRole("link", { name: "Tisch anfragen" })).toBeInViewport();
  await expect(hero.getByRole("link", { name: "Speisekarte" })).toBeInViewport();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("Mobile: Handlungsleiste erscheint nach dem Eingang und tritt bei der Anfrage zurück", async ({ page, isMobile }) => {
  test.skip(!isMobile, "nur mobil");
  await page.goto(PAGE);
  const bar = page.getByRole("navigation", { name: "Schnellzugriff" });
  await expect(bar).toBeHidden();

  await page.locator("#geschichte").scrollIntoViewIfNeeded();
  await expect(bar).toBeVisible();
  await expect(bar.getByRole("link", { name: "Tisch anfragen" })).toHaveAttribute("href", "#reservieren");

  await page.locator("#reservieren form").scrollIntoViewIfNeeded();
  await expect(bar).toBeHidden();
});

test("Mobile: Menü per Tastatur, Ziele erreichbar", async ({ page, isMobile }) => {
  test.skip(!isMobile, "nur mobil");
  await page.goto(PAGE);
  await page.getByText("Menü", { exact: true }).focus();
  await page.keyboard.press("Enter");
  const sheet = page.getByRole("navigation", { name: "Hauptnavigation (mobil)" });
  await expect(sheet.getByRole("link", { name: "Karte" })).toBeVisible();
  await sheet.getByRole("link", { name: "Karte" }).click();
  await expect(page).toHaveURL(/#karte$/);
});

test("Kartenkategorien sind per Tastatur anspringbar", async ({ page }) => {
  await page.goto(PAGE);
  const categories = page.getByRole("navigation", { name: "Kategorien der Karte" });
  await categories.getByRole("link", { name: "Süßes und Chai" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#karte-suesses-und-chai$/);
  await expect(page.getByRole("heading", { level: 3, name: "Süßes und Chai" })).toBeInViewport();
});

test("Galerie lässt sich fokussieren und mit Pfeiltasten scrollen", async ({ page }) => {
  await page.goto(PAGE);
  const gallery = page.getByRole("region", { name: "Bildreihe zum Raum, seitlich scrollbar" });
  await gallery.focus();
  await expect(gallery).toBeFocused();
  const before = await gallery.evaluate((element) => element.scrollLeft);
  const scrollable = await gallery.evaluate((element) => element.scrollWidth > element.clientWidth);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  if (scrollable) await expect.poll(() => gallery.evaluate((element) => element.scrollLeft)).toBeGreaterThan(before);
});

test("Reduzierte Bewegung: keine Animation, alle Inhalte sichtbar", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(PAGE);
  await page.mouse.wheel(0, 2500);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  const claim = page.locator("[data-reveal-text]");
  expect(await claim.evaluate((element) => getComputedStyle(element).maskImage)).toBe("none");
  await context.close();
});

test("Ohne Wunsch nach reduzierter Bewegung laufen nur scroll-gebundene Effekte", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.goto(PAGE);
  const timelines = await page.evaluate(() =>
    document.getAnimations().map((animation) => (animation.timeline && "source" in animation.timeline ? "scroll" : "time")),
  );
  expect(timelines.length).toBeGreaterThan(0);
  expect(timelines.filter((kind) => kind === "time")).toEqual([]);
  await context.close();
});
