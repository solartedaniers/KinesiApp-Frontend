import { expect, test } from "@playwright/test";

import { es } from "./dictionaries";

const fields = es.fields;

test("la lista de requisitos de la contraseña se marca mientras escribo", async ({ page }) => {
  await page.goto("/register");
  const requirements = page.locator("#field-password-requirements li");
  const password = page.getByLabel(fields.password, { exact: true });

  // Lo reintento porque lo que escribo antes de la hidratación no dispara onChange; vacío primero porque
  // React ignora un input que deja el mismo valor
  await expect(async () => {
    await password.fill("");
    await password.fill("abc");
    await expect(requirements.filter({ hasText: fields.passwordRequirementMet })).toHaveCount(1, { timeout: 1000 });
  }).toPass();

  await password.fill("Abcdef1!");
  await expect(requirements.filter({ hasText: fields.passwordRequirementMet })).toHaveCount(5);
});

test("la Server Action del login valida antes de llamar al backend", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: es.login.submit }).click();
  await expect(page.getByText(es.validation.required)).toHaveCount(2);
  await expect(page).toHaveURL(/\/login$/);
});
