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

  test("PWA: los iconos PNG se sirven y el HTML los declara", async ({ page }) => {
    await page.goto("/");

    // iOS no acepta SVG: estos PNG los genera `npm run icons`.
    const appleIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleIcon).toHaveCount(1);
    const appleHref = await appleIcon.getAttribute("href");
    expect(appleHref).toBeTruthy();
    const appleResponse = await page.request.get(appleHref ?? "/apple-touch-icon.png");
    expect(appleResponse.ok()).toBeTruthy();
    expect(appleResponse.headers()["content-type"]).toContain("image/png");

    // Los PNG del manifiesto existen y son PNG de verdad (firma PNG, 8 bytes).
    const manifestBody = await (await page.request.get("/manifest.webmanifest")).json();
    const png = manifestBody.icons.filter((icon: { type?: string }) => icon.type === "image/png");
    expect(png.length).toBeGreaterThanOrEqual(3);
    for (const icon of png) {
      const response = await page.request.get(icon.src);
      expect(response.ok(), `falta ${icon.src}`).toBeTruthy();
      expect(response.headers()["content-type"]).toContain("image/png");
      const body = await response.body();
      expect(body.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    }
  });
});
