import { type APIRequestContext, expect, type Page, test } from "@playwright/test";

// Conversion-Layer (ROADMAP Stufe 5, ADR 0023): Anfrage-Probe mit Beispielhäusern gegen den lokalen
// Resend-Ersatz (tests/support/mock-resend.mjs). Geprüft wird der ganze Weg bis zu den zwei E-Mails.

const MOCK = `http://127.0.0.1:${process.env.E2E_MOCK_RESEND_PORT ?? 3111}`;
const KRAMERWIRT = "/anfrage-probe/gasthaus-zum-kramerwirt";

type SentMail = { readonly to: readonly string[]; readonly subject: string; readonly text: string; readonly reply_to?: string };

/** Jeder Test ein eigener Absender – das Rate-Limit zählt je X-Forwarded-For. */
let counter = 0;
const uniqueIp = () => `198.51.100.${(Date.now() + (counter += 1) * 7) % 250}`;

/** Nächster Kalendertag mit diesem Wochentag (0 = So … 6 = Sa), mindestens zwei Tage voraus. */
function nextWeekday(weekday: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 2);
  while (date.getUTCDay() !== weekday) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

async function mailsFor(request: APIRequestContext, guest: string): Promise<SentMail[]> {
  const response = await request.get(`${MOCK}/__sent`);
  const all = (await response.json()) as SentMail[];
  return all.filter((mail) => mail.to.includes(guest) || mail.reply_to === guest);
}

async function fillTable(page: Page, form: ReturnType<Page["locator"]>, values: { email: string; date: string; time?: string; party?: string }) {
  await form.getByLabel("Name").fill("Maria Huber");
  await form.getByLabel("E-Mail").fill(values.email);
  await form.getByLabel("Datum").fill(values.date);
  await form.getByLabel("Uhrzeit").fill(values.time ?? "19:30");
  await form.getByLabel("Personen").fill(values.party ?? "4");
  // Schneller als 2,5 Sekunden füllt kein Mensch aus (Spam-Schutz, ADR 0023).
  await page.waitForTimeout(2600);
}

test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": uniqueIp() });
});

test("Tischanfrage mit JavaScript: Bestätigung auf der Seite, E-Mail an das Studio und an den Gast", async ({ page, request }, testInfo) => {
  const guest = `tisch-${testInfo.project.name}-${Date.now()}@example.org`;
  await page.goto(KRAMERWIRT);
  await expect(page.getByRole("note")).toContainText("Anfrage-Probe, nur lokal");
  const form = page.locator("#tisch-anfragen form");
  await fillTable(page, form, { email: guest, date: nextWeekday(5) });
  await form.getByRole("button", { name: "Anfrage senden" }).click();

  const status = page.getByRole("status");
  await expect(status).toContainText("Anfrage verschickt");
  await expect(status).toContainText("noch keine Reservierung");
  await expect(status).toBeFocused();

  await expect.poll(async () => (await mailsFor(request, guest)).length).toBe(2);
  const [business, confirmation] = await mailsFor(request, guest);
  expect(business?.to).toEqual(["studio@example.org"]);
  expect(business?.subject).toMatch(/^\[Probe\] Tischanfrage: 4 Personen, Fr /);
  expect(business?.reply_to).toBe(guest);
  expect(confirmation?.to).toEqual([guest]);
  expect(confirmation?.text).toContain("Das ist noch keine Reservierung");
});

test("Fehler stehen am Feld, der Fokus springt zum ersten – und Ruhetage meldet der Server", async ({ page, request }, testInfo) => {
  const guest = `fehler-${testInfo.project.name}-${Date.now()}@example.org`;
  await page.goto(KRAMERWIRT);
  const form = page.locator("#tisch-anfragen form");
  await form.getByRole("button", { name: "Anfrage senden" }).click();

  const name = form.getByLabel("Name");
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toHaveAccessibleDescription("Bitte geben Sie Ihren Namen an.");
  await expect(form.getByRole("alert")).toHaveText("Bitte prüfen Sie die markierten Felder.");

  // Montag ist beim Kramerwirt Ruhetag – das weiß nur der Server.
  await fillTable(page, form, { email: guest, date: nextWeekday(1) });
  await form.getByRole("button", { name: "Anfrage senden" }).click();
  const date = form.getByLabel("Datum");
  await expect(date).toBeFocused();
  await expect(date).toHaveAccessibleDescription("Montag ist Ruhetag – bitte einen anderen Tag wählen.");
  expect(await mailsFor(request, guest)).toEqual([]);
});

test("Ohne JavaScript schickt der Browser das Formular ab und die Route antwortet mit einer eigenen Seite", async ({ browser, request }, testInfo) => {
  const guest = `ohne-js-${testInfo.project.name}-${Date.now()}@example.org`;
  const context = await browser.newContext({ javaScriptEnabled: false, extraHTTPHeaders: { "x-forwarded-for": uniqueIp() } });
  const page = await context.newPage();
  await page.goto(KRAMERWIRT);
  const form = page.locator("#tisch-anfragen form");
  await form.getByLabel("Name").fill("Maria Huber");
  await form.getByLabel("E-Mail").fill(guest);
  await form.getByLabel("Datum").fill(nextWeekday(6));
  await form.getByLabel("Uhrzeit").fill("12:30");
  await form.getByLabel("Personen").fill("2");
  await form.getByRole("button", { name: "Anfrage senden" }).click();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Anfrage verschickt");
  await expect(page.getByRole("link", { name: "Zurück zur Seite" })).toHaveAttribute("href", KRAMERWIRT);
  await expect.poll(async () => (await mailsFor(request, guest)).length).toBe(2);
  await context.close();
});

test("Scheitert nur die Bestätigung an den Gast, sagt die Seite das ehrlich", async ({ page }, testInfo) => {
  await page.goto(KRAMERWIRT);
  const form = page.locator("#tisch-anfragen form");
  await fillTable(page, form, { email: `unzustellbar-${testInfo.project.name}-${Date.now()}@example.org`, date: nextWeekday(5), party: "3" });
  await form.getByRole("button", { name: "Anfrage senden" }).click();
  await expect(page.getByRole("status")).toContainText("Die Eingangsbestätigung per E-Mail ließ sich nicht verschicken");
});

test("Abholung: eigene Felder, Bestellung landet im Text", async ({ page, request }, testInfo) => {
  const guest = `abholung-${testInfo.project.name}-${Date.now()}@example.org`;
  await page.goto("/anfrage-probe/nudelhaus-jin");
  const form = page.locator("#abholung-anfragen form");
  await form.getByLabel("Name").fill("Jonas Berg");
  await form.getByLabel("E-Mail").fill(guest);
  await form.getByLabel("Abholtag").fill(nextWeekday(6));
  await form.getByLabel("Abholzeit").fill("12:30");
  await form.getByLabel("Was dürfen wir vorbereiten?").fill("2 × Dan-Dan-Nudeln\n1 × Gurkensalat");
  await page.waitForTimeout(2600);
  await form.getByRole("button", { name: "Bestellung senden" }).click();

  await expect(page.getByRole("status")).toContainText("Bestellung verschickt");
  await expect.poll(async () => (await mailsFor(request, guest)).length).toBe(2);
  const [business] = await mailsFor(request, guest);
  expect(business?.subject).toMatch(/^\[Probe\] Abholung: Sa /);
  expect(business?.text).toContain("Bestellung:\n2 × Dan-Dan-Nudeln\n1 × Gurkensalat");
});

test("Beispielseiten bleiben gesperrt – nur die lokale Probe verschickt etwas", async ({ page }) => {
  await page.goto("/beispiele/gasthaus-zum-kramerwirt");
  const form = page.locator("#tisch-anfragen form");
  await expect(form.getByRole("button", { name: "Anfrage senden" })).toBeDisabled();
  await expect(form).not.toHaveAttribute("action", /.+/);
});
