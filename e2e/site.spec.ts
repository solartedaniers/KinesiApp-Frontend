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
