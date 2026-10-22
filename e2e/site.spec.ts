import { expect, type Page, test } from "@playwright/test";

import { en, es } from "./dictionaries";

const PUBLIC_PAGES = ["/", "/en", "/guide/jump", "/en/guide/squat", "/legal/video-consent", "/login", "/register", "/style-guide"];

async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
}

test("la landing tiene un solo h1, su metadata y el idioma del documento", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page).toHaveTitle(es.landing.metaTitle);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", es.landing.metaDescription);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(es.landing.title);
});

test("la tarjeta de consentimiento lleva a la página legal", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: es.site.legal }).click();
  await expect(page).toHaveURL(/\/legal\/video-consent$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(es.consent.title);
});

test("la cabecera muestra Iniciar sesión en el celular y las dos opciones en PC; el pie solo el aviso", async ({ page, isMobile }) => {
  await page.goto("/");
  const header = page.getByRole("banner");
  await expect(header.getByRole("link", { name: es.site.signIn, exact: true })).toBeVisible();
  await expect(header.getByRole("link", { name: es.site.createAccount, exact: true })).toBeVisible({ visible: !isMobile });

  const footer = page.getByRole("contentinfo");
  await expect(footer.getByText(es.app.disclaimer)).toBeVisible();
  await expect(footer.getByRole("link")).toHaveCount(0);
});

test("el selector de idioma pasa la landing a inglés", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: es.preferences.languageNames.en }).first().click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.landing.title);
});

test("el tema oscuro se aplica al instante y sobrevive la recarga", async ({ page }) => {
  await page.goto("/");
  const background = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const light = await background();

  await page.getByRole("button", { name: es.preferences.themeNames.dark }).first().click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  // El fondo cambia con una transición corta
  await expect.poll(background).not.toBe(light);

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: es.preferences.themeNames.dark }).first()).toHaveAttribute("aria-pressed", "true");
});

function countServerActions(page: Page): string[] {
  const actions: string[] = [];
  page.on("request", (request) => {
    if (request.headers()["next-action"]) actions.push(request.url());
  });
  return actions;
}

const visibleButton = (page: Page, name: string) => page.getByRole("button", { name }).filter({ visible: true }).first();

test("en la app el tema se aplica en el navegador, sin Server Action, y sobrevive la recarga", async ({ page }) => {
  const actions = countServerActions(page);
  await page.goto("/login");
  await visibleButton(page, es.preferences.themeNames.dark).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(actions).toHaveLength(0);

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(visibleButton(page, es.preferences.themeNames.dark)).toHaveAttribute("aria-pressed", "true");
});

test("en la app el idioma muestra su carga, deja usar el tema y no encola clics", async ({ page, browserName }) => {
  test.skip(browserName === "webkit", "WebKit en Windows no deja interceptar el fetch de la Server Action, y sin retrasarla no se alcanza a ver la carga");
  const actions = countServerActions(page);
  await page.goto("/login");
  // Retraso la Server Action para ver el estado de carga y comprobar que los clics de más se ignoran
  await page.route("**/login", async (route) => {
    if (route.request().headers()["next-action"]) await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.continue();
  });
  const english = visibleButton(page, es.preferences.languageNames.en);
  await english.click();
  await expect(english).toHaveAttribute("aria-pressed", "true");
  await expect(english).toHaveClass(/kin-shimmer/);
  await expect(page.locator('fieldset[aria-busy="true"]').filter({ visible: true })).toHaveCount(1);
  // Playwright espera a que un botón aria-disabled se habilite: fuerzo el clic para que llegue durante la carga
  await visibleButton(page, es.preferences.languageNames.es).click({ force: true });
  await visibleButton(page, es.preferences.themeNames.dark).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.login.title);
  await expect(page.locator('fieldset[aria-busy="true"]')).toHaveCount(0);
  expect(actions).toHaveLength(1);
});

for (const path of PUBLIC_PAGES) {
  test(`${path} no se desborda a lo ancho`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    expect(await hasHorizontalScroll(page)).toBe(false);
  });
}

test("con movimiento reducido las animaciones de entrada terminan al instante", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const durations = await page.locator(".kin-rise").evaluateAll((elements) =>
    elements.map((element) => parseFloat(getComputedStyle(element).animationDuration)),
  );
  expect(durations.length).toBeGreaterThan(0);
  expect(Math.max(...durations)).toBeLessThan(0.01);
});
