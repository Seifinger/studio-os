import { defineConfig, devices } from "@playwright/test";

// Voraussetzung: `npm run build`. Playwright startet den Resend-Ersatz und `next start` selbst.
const port = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://127.0.0.1:${port}`;
const mockResendPort = Number(process.env.E2E_MOCK_RESEND_PORT ?? 3111);

// Anfrage-Probe gegen den lokalen Resend-Ersatz (ADR 0023): echte Route, echter Adapter, keine echte
// E-Mail. Alle Werte sind erfunden; Schlüssel und Adressen gelten nur für den Ersatzserver.
const requestProbeEnv = {
  STUDIO_REQUEST_PROBE: "local",
  STUDIO_OPERATOR_NAME: "Studio Beispiel (Test)",
  STUDIO_OPERATOR_ADDRESS: "Probegasse 1, 00123 Beispielstadt",
  STUDIO_OPERATOR_EMAIL: "studio@example.org",
  RESEND_API_KEY: "re_e2e_test",
  EMAIL_FROM: "Anfragen <anfragen@studio.example>",
  RESEND_BASE_URL: `http://127.0.0.1:${mockResendPort}`,
};

// Optional: vorhandenes Chromium statt `npx playwright install` nutzen.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: "list",
  use: {
    baseURL,
    locale: "de-DE",
    trace: "retain-on-failure",
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    { name: "mobil", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: [
    {
      command: "node tests/support/mock-resend.mjs",
      url: `http://127.0.0.1:${mockResendPort}/__health`,
      env: { MOCK_RESEND_PORT: String(mockResendPort), MOCK_RESEND_KEY: requestProbeEnv.RESEND_API_KEY },
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: `npm run start -- --hostname 127.0.0.1 --port ${port}`,
      url: `${baseURL}/api/health`,
      env: requestProbeEnv,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
