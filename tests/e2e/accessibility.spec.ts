import { test, expect } from "@playwright/test";

test.describe("English Quest - accessibility", () => {
  test("landing has lang es and a skip link", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", /es/i);
    await expect(page.locator('a[href="#contenido"]')).toHaveCount(1);
  });

  test("responsive: single main landmark and no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main")).toHaveCount(1);
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2,
    );
    expect(hasOverflow).toBeFalsy();
  });

  test("private zone includes noindex policy", async ({ page }) => {
    await page.goto("/padres");
    const robots = await page.evaluate(
      () => document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "",
    );
    expect(robots).toMatch(/noindex/i);
  });

  test("every checked page exposes exactly one h1", async ({ page }) => {
    for (const path of ["/", "/empezar", "/privacidad"]) {
      await page.goto(path);
      await expect(page.locator("h1")).toHaveCount(1);
    }
  });
});
