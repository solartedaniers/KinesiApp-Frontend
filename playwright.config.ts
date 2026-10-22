import { defineConfig, devices } from "@playwright/test";

// Por defecto pruebo el build de producción local; con E2E_BASE_URL corro lo mismo contra un preview de Vercel
const port = Number(process.env.E2E_PORT ?? 3100);
const externalBaseUrl = process.env.E2E_BASE_URL;
const baseURL = externalBaseUrl ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  // Con más procesos, cinco navegadores a la vez en una laptop dan fallas por carga, no por la app: el
  // servidor responde en milisegundos, pero Firefox y WebKit pintan la landing animada por software
  workers: 2,
  expect: { timeout: 10_000 },
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: { baseURL, trace: "retain-on-failure", locale: "es-CO" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } },
  ],
  webServer: externalBaseUrl
    ? undefined
    : { command: `npm run start -- -p ${port}`, url: baseURL, reuseExistingServer: !process.env.CI, timeout: 120_000 },
});
