import { expect, test, type Page } from "@playwright/test";

import { finishSession } from "./answers";
import {
  correctResponse,
  createProfileViaUi,
  findProfileId,
  lessonActivities,
  sendAnswer,
} from "./helpers";

/**
 * Flujo de repaso (`/jugar/practicar`).
 *
 * El plan de repaso sale del servidor a partir del progreso guardado. Para no
 * esperar los intervalos reales (un fallo no se propone hasta el dia siguiente)
 * la CI arranca el servidor con `REVIEW_TIME_OFFSET_MS` adelantando el reloj.
 * Sin perfiles ni progreso, el plan esta vacio por definicion.
 */

/**
 * Cada prueba corre con su PROPIO dueño (una cookie `eq_session` nueva), para
 * que el progreso sembrado en una no aparezca en otra. Playwright reutiliza el
 * contexto dentro de un worker: hay que limpiar las cookies antes de empezar y
 * volver a crear la sesion con la primera llamada a la API.
 */
test.beforeEach(async ({ context }) => {
  await context.clearCookies();
});

/** Crea un dueño nuevo llamando a la API (el servidor emite `eq_session`). */
async function freshOwner(page: Page): Promise<void> {
  const response = await page.request.get("/api/v1/profiles");
  expect(response.ok()).toBeTruthy();
}

/** Crea un perfil y deja su identificador, partiendo de una sesion limpia. */
async function setUpProfile(page: Page): Promise<{ name: string; profileId: string }> {
  const name = await createProfileViaUi(page);
  const profileId = await findProfileId(page, name);
  return { name, profileId };
}

test.describe("English Quest - repaso", () => {
  test("sin perfil invita a elegir uno", async ({ page }) => {
    await freshOwner(page);
    await page.goto("/jugar/practicar");

    await expect(page.getByText("Elige un perfil para repasar")).toBeVisible();
    await expect(page.getByRole("link", { name: /Elegir perfil/i })).toBeVisible();
  });

  test("con un perfil recien creado no hay nada pendiente", async ({ page }) => {
    await freshOwner(page);
    await setUpProfile(page);
    await page.goto("/jugar/practicar");

    await expect(page.getByText(/Vas al dia/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Ir al mapa de mundos/i })).toBeVisible();
  });

  test("con progreso vencido monta la sesion de repaso", async ({ page }) => {
    await freshOwner(page);
    const { profileId } = await setUpProfile(page);

    const activities = await lessonActivities(page, "hello-village", "hello-01", profileId);
    // `hello-01-listen` tiene `hello` como primera opcion y como respuesta.
    const listen = activities.find((activity) => activity.id === "hello-01-listen");
    expect(listen, "falta la actividad hello-01-listen").toBeTruthy();
    if (!listen) return;

    const result = await sendAnswer(page, listen, profileId, correctResponse(listen));
    expect(result.correct).toBe(true);

    await page.goto("/jugar/practicar");
    await expect(page.getByRole("heading", { name: /Repaso de palabras/i })).toBeVisible();
    await expect(page.getByText(/Nivel de hoy/i)).toBeVisible();
  });

  test("se puede completar una sesion de repaso de principio a fin", async ({ page }) => {
    test.setTimeout(120_000);
    await freshOwner(page);
    const { profileId } = await setUpProfile(page);

    const activities = await lessonActivities(page, "hello-village", "hello-01", profileId);
    const listen = activities.find((activity) => activity.id === "hello-01-listen");
    expect(listen, "falta la actividad hello-01-listen").toBeTruthy();
    if (!listen) return;

    await sendAnswer(page, listen, profileId, correctResponse(listen));

    await page.goto("/jugar/practicar");
    await page.getByRole("button", { name: /^Empezar$/i }).click();

    await expect(page.getByText(/Actividad 1 de/i)).toBeVisible();
    await finishSession(page);

    await expect(page.getByRole("heading", { name: /Mision cumplida/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Volver al inicio/i })).toBeVisible();
  });
});
