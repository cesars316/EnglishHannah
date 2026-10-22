import { expect, type Page } from "@playwright/test";

/**
 * Utilidades compartidas por las pruebas E2E.
 *
 * Las pruebas hablan con la API con `page.request`, que comparte el cookie jar
 * con la pagina: el servidor crea la sesion (`eq_session`) si falta, asi que se
 * puede preparar estado sin pasar por la interfaz.
 */

/** Datos de una actividad publica tal como los sirve la API (sin `answerKey`). */
export type PublicActivity = {
  id: string;
  type: string;
  lessonId: string;
  vocabularyIds: string[];
  content: Record<string, unknown>;
};

/**
 * Crea un dueno nuevo llamando a la API.
 *
 * El servidor emite la cookie `eq_session` si falta. Playwright reutiliza el
 * contexto dentro de un worker, asi que las pruebas que necesitan aislamiento
 * limpian antes las cookies (`context.clearCookies()`) y luego llaman aqui.
 */
export async function freshOwner(page: Page): Promise<void> {
  const response = await page.request.get("/api/v1/profiles");
  expect(response.ok()).toBeTruthy();
}

/** Crea un perfil desde la interfaz y lo deja activo. Devuelve su nombre. */
export async function createProfileViaUi(page: Page, displayName?: string): Promise<string> {
  const name = displayName ?? `Nina${Date.now().toString(36).slice(-5)}`;

  await page.goto("/empezar");
  await page
    .getByRole("button", { name: /Crear un perfil|Anadir otro perfil/i })
    .first()
    .click();
  await page.getByLabel(/Como te llamas/i).fill(name);
  await page.getByRole("button", { name: /^Crear perfil$/i }).click();
  await page.getByRole("button", { name: /Ir a jugar/i }).click();
  await expect(page).toHaveURL(/\/jugar/);

  return name;
}

/** Identificador del perfil indicado (o del primero que exista). */
export async function findProfileId(page: Page, displayName?: string): Promise<string> {
  const response = await page.request.get("/api/v1/profiles");
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as {
    data: { profiles: { id: string; displayName: string }[] };
  };

  const profiles = body.data.profiles;
  const profile = displayName
    ? profiles.find((item) => item.displayName === displayName)
    : profiles[0];
  if (!profile) throw new Error(`No se encontro el perfil "${displayName ?? "(primero)"}".`);
  return profile.id;
}

/** Actividades de la primera leccion del mundo de saludos. */
export async function lessonActivities(
  page: Page,
  worldId: string,
  lessonId: string,
  profileId: string,
): Promise<PublicActivity[]> {
  const response = await page.request.get(
    `/api/v1/lessons/${lessonId}?profileId=${encodeURIComponent(profileId)}`,
  );
  expect(response.ok(), `no se pudo leer la leccion ${worldId}/${lessonId}`).toBeTruthy();

  const body = (await response.json()) as { data: { activities: PublicActivity[] } };
  return body.data.activities;
}

/** Respuesta CORRECTA para una actividad publica (el servidor la validara). */
export function correctResponse(activity: PublicActivity): unknown {
  const content = activity.content as {
    options?: { id: string }[];
    pairs?: { left: { id: string }; right: { id: string } }[];
    tokens?: string[];
    questions?: { id: string; options: { id: string }[] }[];
  };
  if (!content.options) throw new Error(`Tipo no soportado por el helper: ${activity.type}`);
  return { kind: "choice", optionId: content.options[0]?.id ?? "__invalida__" };
}

/**
 * Registra un intento de actividad por API.
 *
 * Se usa para preparar progreso sin jugar la leccion entera. El servidor es la
 * autoridad: aqui solo se le entrega un intento como el que enviaria la interfaz.
 */
export async function sendAnswer(
  page: Page,
  activity: PublicActivity,
  profileId: string,
  response: unknown,
): Promise<{ correct: boolean }> {
  const reply = await page.request.post(`/api/v1/activities/${activity.id}/answer`, {
    data: {
      profileId,
      clientAttemptId: crypto.randomUUID(),
      response,
      attemptNumber: 1,
      durationMs: 4_000,
      hintUsed: false,
      isReview: false,
    },
  });
  expect(reply.ok(), `no se pudo registrar el intento (${reply.status()})`).toBeTruthy();

  const body = (await reply.json()) as { data: { evaluation: { isCorrect: boolean } } };
  return { correct: body.data.evaluation.isCorrect };
}
