import { test, expect, type Page } from "@playwright/test";

async function createProfile(page: Page): Promise<void> {
  await page.goto("/empezar");
  await page
    .getByRole("button", { name: /Crear un perfil|Anadir otro perfil/i })
    .first()
    .click();
  await page.getByLabel(/Como te llamas/i).fill("TestE2E");
  await page.getByRole("button", { name: /^Crear perfil$/i }).click();
  await page.getByRole("button", { name: /Ir a jugar/i }).click();
  await expect(page).toHaveURL(/\/jugar/);
}

test.describe("English Quest - jugar", () => {
  test("can create a profile and reach the game area", async ({ page }) => {
    await createProfile(page);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("can open the world map from the game area", async ({ page }) => {
    await createProfile(page);
    await page
      .getByRole("link", { name: /^Mapa$/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/jugar\/mapa/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
