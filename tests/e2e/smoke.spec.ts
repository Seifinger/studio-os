import { expect, test } from "@playwright/test";

// Vorbereiteter Smoke-Test – bewusst klein (CLAUDE.md, Abschnitt 3).

test("Startseite rendert auf Deutsch, ohne horizontales Scrollen", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  await expect(page).toHaveTitle("Studio OS");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.getByRole("heading", { level: 1, name: "Studio OS" })).toBeVisible();

  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
});

test("Sprunglink ist der erste Tastaturstopp", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Zum Inhalt springen" })).toBeFocused();
});

test("Health-Check antwortet mit ok und ohne Cache", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(await response.json()).toMatchObject({ status: "ok", service: "studio-os" });
});

test("Unbekannte Seiten liefern eine deutsche 404-Seite", async ({ page }) => {
  const response = await page.goto("/gibt-es-nicht");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "Diese Seite gibt es nicht." })).toBeVisible();
});
