import { expect, test, type Page } from "@playwright/test";

import { createProfileViaUi, freshOwner } from "./helpers";

/**
 * Zona de adultos (`/padres`).
 *
 * Se comprueba la puerta (crear el codigo, entrar, bloquear) y que el panel
 * muestra el progreso real de un perfil. Cada prueba arranca con su propio
 * dueño y su perfil para que el estado no se mezcle.
 */

/** Codigo valido segun las reglas de `src/lib/passcode.ts`. */
const PASSCODE = "familia2026";

/**
 * Deja al dueno con un perfil y la zona de adultos desbloqueada, sin pasar por
 * la interfaz: prepara el estado para probar el panel.
 */
async function unlockViaApi(page: Page): Promise<void> {
  await freshOwner(page);
  await createProfileViaUi(page);

  const setup = await page.request.post("/api/v1/parent/setup", {
    data: { passcode: PASSCODE },
  });
  expect(setup.ok(), `no se pudo crear el codigo (${setup.status()})`).toBeTruthy();
}

test.describe("English Quest - zona de adultos", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("la primera vez pide crear el codigo de adulto", async ({ page }) => {
    await freshOwner(page);
    await page.goto("/padres");

    await expect(page.getByRole("heading", { name: /Crea tu codigo de adulto/i })).toBeVisible();
    await expect(page.getByLabel(/Nuevo codigo/i)).toBeVisible();
    await expect(page.getByLabel(/Repite el codigo/i)).toBeVisible();
  });

  test("se crea el codigo desde la interfaz y se entra al panel", async ({ page }) => {
    await freshOwner(page);
    const name = await createProfileViaUi(page);

    await page.goto("/padres");
    await page.getByLabel(/Nuevo codigo/i).fill(PASSCODE);
    await page.getByLabel(/Repite el codigo/i).fill(PASSCODE);
    await page.getByRole("button", { name: /Crear codigo y entrar/i }).click();

    await expect(page.getByRole("heading", { name: /Progreso de cada ni/i })).toBeVisible();
    // El perfil recien creado aparece en el selector de perfiles del panel.
    await expect(page.locator("#parent-profile option", { hasText: name }).first()).toHaveCount(1);
    await expect(page.getByRole("button", { name: /Bloquear la zona de adultos/i })).toBeVisible();
  });

  test("con el codigo ya creado pide entrar y luego permite bloquear", async ({ page }) => {
    await unlockViaApi(page);

    // Al recargar, el servidor recuerda el desbloqueo durante unos minutos.
    await page.goto("/padres");
    await expect(page.getByRole("heading", { name: /Progreso de cada ni/i })).toBeVisible();

    await page.getByRole("button", { name: /Bloquear la zona de adultos/i }).click();

    // Tras bloquear, vuelve a pedir el codigo (ya no se pide crearlo).
    await expect(page.getByRole("heading", { name: /^Zona de adultos$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Entrar$/i })).toBeVisible();
  });

  test("un codigo incorrecto no deja entrar", async ({ page }) => {
    await unlockViaApi(page);
    await page.goto("/padres");
    await page.getByRole("button", { name: /Bloquear la zona de adultos/i }).click();

    await page.getByLabel(/^Codigo$/i).fill("otroCodigo9");
    await page.getByRole("button", { name: /^Entrar$/i }).click();

    await expect(page.getByText(/No se pudo continuar/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /^Zona de adultos$/i })).toBeVisible();
  });

  test("el panel muestra el progreso y los ajustes del perfil activo", async ({ page }) => {
    await unlockViaApi(page);
    await page.goto("/padres");

    // Tarjetas de resumen.
    await expect(page.getByText(/Experiencia/i)).toBeVisible();
    await expect(page.getByText(/Monedas/i)).toBeVisible();
    await expect(page.getByText(/Tiempo de practica/i)).toBeVisible();

    // Habilidades y ajustes.
    await expect(page.getByRole("heading", { name: /Practica por habilidad/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Ajustes de/i })).toBeVisible();
    await expect(page.getByRole("switch", { name: /Sonido del juego/i })).toBeVisible();
    await expect(page.getByRole("switch", { name: /Microfono/i })).toBeVisible();

    // El aviso de privacidad sobre el microfono debe estar a la vista.
    await expect(page.getByText(/Nunca se guardan fotos ni video/i)).toBeVisible();
  });

  test("los ajustes se activan con el interruptor del panel", async ({ page }) => {
    await unlockViaApi(page);
    await page.goto("/padres");

    const sonido = page.getByRole("switch", { name: /Sonido del juego/i });
    await expect(sonido).toBeVisible();
    const antes = await sonido.getAttribute("aria-checked");

    await sonido.click();
    await expect(sonido).not.toHaveAttribute("aria-checked", antes ?? "");
  });
});
