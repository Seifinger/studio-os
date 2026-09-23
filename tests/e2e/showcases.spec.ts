import { expect, test } from "@playwright/test";

// Beispielseiten im Browser: Hinweis, noindex, kein horizontales Scrollen, Tastatur, Touch-Ziele,
// reduzierte Bewegung. Läuft mobil (Pixel 7) und am Desktop (playwright.config.ts).

const SLUGS = ["gasthaus-zum-kramerwirt", "nudelhaus-jin", "trattoria-da-paola", "izakaya-tomo", "mangal-kaya", "kellerstube-eichhorn"];

test("Übersicht listet die Beispielseiten und ist nicht indexierbar", async ({ page }) => {
  await page.goto("/beispiele");
  await expect(page.getByRole("heading", { level: 1, name: "Restaurants, die es nicht gibt" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Beispielseiten" }).getByRole("link")).toHaveCount(14);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

for (const slug of SLUGS) {
  test(`${slug}: Hinweis, Überschrift, kein Überlauf, keine Wähllinks`, async ({ page }) => {
    const response = await page.goto(`/beispiele/${slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("note")).toContainText("dieser Betrieb ist frei erfunden");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('a[href^="tel:"], a[href*="wa.me"], a[href*="google.com/maps"]')).toHaveCount(0);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("Handlungsknöpfe sind groß genug zum Tippen", async ({ page }) => {
  await page.goto("/beispiele/gasthaus-zum-kramerwirt");
  for (const link of await page.locator("main a[href^='#']").all()) {
    if (!(await link.isVisible())) continue;
    const box = await link.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
});

test("Mobile: Menü öffnet sich per Tastatur, Handlungsleiste bleibt sichtbar", async ({ page, isMobile }) => {
  test.skip(!isMobile, "nur mobil");
  await page.goto("/beispiele/trattoria-da-paola");
  const toggle = page.getByText("Menü", { exact: true });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("details[open]").getByRole("link", { name: "Speisekarte" })).toBeVisible();

  const bar = page.getByRole("navigation", { name: "Schnellzugriff" });
  await expect(bar).toBeVisible();
  await page.mouse.wheel(0, 2000);
  await expect(bar).toBeInViewport();
});

test("Formulare in Demos senden nichts und sagen das", async ({ page }) => {
  await page.goto("/beispiele/gasthaus-zum-kramerwirt");
  const form = page.locator("#tisch-anfragen");
  await expect(form.getByRole("button", { name: "Anfrage senden" })).toBeDisabled();
  await expect(form).toContainText("In dieser Demo wird nichts verschickt");
  await expect(form.getByLabel("Name")).toHaveAttribute("autocomplete", "name");
});

test("Reduzierte Bewegung: keine laufenden Animationen", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/beispiele/mangal-kaya");
  const animations = await page.evaluate(() => document.getAnimations().length);
  expect(animations).toBe(0);
  await context.close();
});

test("Lead-Demos sind ohne Freischaltung abgeschaltet", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/abgeschaltet|Konzept-Demo/);
});
