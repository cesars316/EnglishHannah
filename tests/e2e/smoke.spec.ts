import { test, expect } from "@playwright/test";

test.describe("English Quest - smoke", () => {
  test("landing page shows title and call to action", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Aprende ingles jugando/i);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("English Quest");
    await expect(page.getByRole("link", { name: /Empezar la aventura/i })).toBeVisible();
  });

  test("privacy page shows data handling info", async ({ page }) => {
    await page.goto("/privacidad");
    await expect(
      page.getByRole("heading", { level: 1, name: /Como cuidamos los datos/i }),
    ).toBeVisible();
    await expect(page.getByText(/MongoDB/i).first()).toBeVisible();
  });

  test("parental zone asks for an adult code", async ({ page }) => {
    await page.goto("/padres");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /codigo de adulto|Zona de adultos/i,
    );
  });

  test("start page shows profile creation", async ({ page }) => {
    await page.goto("/empezar");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/perfil/i);
  });

  test("PWA: manifest and service worker are served", async ({ page }) => {
    await page.goto("/");

    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);
    const manifestHref = await manifestLink.getAttribute("href");
    expect(manifestHref).toBeTruthy();

    const manifestResponse = await page.request.get(manifestHref ?? "/manifest.webmanifest");
    expect(manifestResponse.ok()).toBeTruthy();
    expect(manifestResponse.headers()["content-type"]).toContain("manifest+json");
    const manifestBody = await manifestResponse.json();
    expect(manifestBody.name).toContain("English Quest");
    expect(manifestBody.icons.length).toBeGreaterThan(0);

    const workerResponse = await page.request.get("/sw.js");
    expect(workerResponse.ok()).toBeTruthy();
    expect(workerResponse.headers()["content-type"]).toContain("javascript");
  });
});
