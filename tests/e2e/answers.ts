import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Motor de respuestas para las pruebas E2E.
 *
 * Estas utilidades recorren una sesion de juego real desde la interfaz, sin
 * conocer el `answerKey` (que nunca llega al cliente). Por eso intentan las
 * opciones disponibles y, cuando el juego revela la solucion, avanzan. Es la
 * forma de comprobar el flujo completo sin saltarse la validacion del servidor.
 */

/** Botones de opcion (todos los tipos de eleccion usan `OptionButton`). */
const OPTION = '[data-testid="option-button"]';

/**
 * Intento actual de la actividad story-quiz en pantalla.
 *
 * La historia solo revela la solucion cuando se agotan los intentos; hasta
 * entonces hay que probar opciones distintas. Este contador hace que cada
 * reintento elija la siguiente opcion de cada pregunta en vez de repetir.
 */
let quizAttempt = 0;

/** Opciones que aun se pueden pulsar (las falladas quedan deshabilitadas). */
function enabledOptions(page: Page): Locator {
  return page.locator(`${OPTION}:not([disabled]):not([aria-disabled="true"])`);
}

/** Responde la actividad que este en pantalla. Devuelve `true` si hizo algo. */
export async function answerCurrentActivity(page: Page): Promise<boolean> {
  // story-quiz: varias preguntas, cada una en su grupo, y un unico Comprobar.
  if (await page.getByRole("heading", { name: /Lee la historia/i }).count()) {
    return answerStoryQuiz(page);
  }

  // matching-pairs: dos grupos (Palabras / Dibujos) que hay que emparejar.
  if (await page.locator('[role="group"][aria-label="Palabras"]').count()) {
    return answerPairs(page);
  }

  // word-builder: fichas de letras o palabras que se van colocando.
  if (await page.getByRole("heading", { name: /Ordena/i }).count()) {
    return answerWordBuilder(page);
  }

  const options = enabledOptions(page);
  const total = await options.count();
  if (total > 0) {
    await options.nth(Math.floor(Math.random() * total)).click();
    return true;
  }

  return false;
}

/**
 * Responde cada pregunta de la historia y pulsa Comprobar.
 *
 * En el primer intento se elige una opcion por pregunta. En los siguientes se
 * rota la eleccion (una opcion distinta por vuelta) hasta que el juego valide o
 * revele la solucion; el boton Comprobar se pulsa en cuanto esta habilitado.
 */
async function answerStoryQuiz(page: Page): Promise<boolean> {
  const groups = page.locator('[role="group"]:has([data-testid="option-button"])');
  const total = await groups.count();
  let clicked = false;

  for (let index = 0; index < total; index += 1) {
    const options = groups.nth(index).locator(`${OPTION}:not([disabled])`);
    const optionCount = await options.count();
    if (optionCount === 0) continue;

    await options.nth(quizAttempt % optionCount).click();
    clicked = true;
  }

  const comprobar = page.getByRole("button", { name: /^Comprobar$/i });
  if (await comprobar.isEnabled().catch(() => false)) {
    await comprobar.click();
    quizAttempt += 1;
    return true;
  }

  // Si no habia nada que pulsar (preguntas ya resueltas o respuesta en camino),
  // se devuelve `false` para que `finishSession` espere en vez de girar en vacio.
  return clicked;
}

/**
 * Empareja cada palabra de la izquierda con una tarjeta de la derecha.
 *
 * matching-pairs funciona en dos pasos: se pulsa una palabra (queda activa) y
 * luego un dibujo (queda colocado). Al comprobar, las parejas acertadas se
 * fijan y las falladas se descartan; en el siguiente intento se colocan las que
 * quedan, rotando la eleccion para no repetir siempre el mismo emparejamiento.
 */
async function answerPairs(page: Page): Promise<boolean> {
  const lefts = page.locator('[role="group"][aria-label="Palabras"] [data-testid="option-button"]');
  const rights = page.locator('[role="group"][aria-label="Dibujos"] [data-testid="option-button"]');

  const leftCount = await lefts.count();
  if (leftCount === 0) return false;

  // En cada intento se desplaza el emparejamiento para probar una combinacion
  // distinta (una palabra con cada dibujo, sin repetir dibujo).
  let used = 0;
  for (let index = 0; index < leftCount; index += 1) {
    const left = lefts.nth(index);
    if (await left.isDisabled()) continue;

    await left.click();

    const free = rights.locator(`:scope:not([disabled]):not([aria-pressed="true"])`);
    const available = await free.count();
    if (available === 0) break;

    const pick = (quizAttempt + used) % available;
    used += 1;
    await free.nth(pick).click();
  }

  const comprobar = page.getByRole("button", { name: /^Comprobar$/i });
  if (await comprobar.isEnabled().catch(() => false)) {
    await comprobar.click();
    quizAttempt += 1;
    return true;
  }
  return leftCount > 0;
}

/**
 * Coloca todas las fichas y comprueba.
 *
 * Es un puzle: acertar a ciegas es improbable, pero el juego revela la solucion
 * agotados los intentos. En cada vuelta se vuelve a colocar todo (borrando lo
 * anterior) y se pulsa Comprobar hasta que el juego valide o revele.
 */
async function answerWordBuilder(page: Page): Promise<boolean> {
  const fichas = page.locator('[aria-label="Fichas disponibles"] button:not([disabled])');
  const borrar = page.getByRole("button", { name: /Borrar y empezar/i });

  // Se parte de una respuesta vacia para que cada intento use un orden nuevo.
  if (await borrar.isEnabled().catch(() => false)) await borrar.click();

  for (let guard = 0; guard < 40; guard += 1) {
    const count = await fichas.count();
    if (count === 0) break;
    // Se rota el punto de partida para probar ordenes distintos entre intentos.
    await fichas.nth((quizAttempt + guard) % count).click();
  }

  const comprobar = page.getByRole("button", { name: /^Comprobar$/i });
  if (await comprobar.isEnabled().catch(() => false)) {
    await comprobar.click();
    quizAttempt += 1;
    return true;
  }
  return false;
}

/**
 * Recorre la sesion hasta la pantalla de resumen.
 *
 * En cada vuelta: si aparece "Continuar" (acierto o respuesta revelada) se
 * pulsa y se cambia de actividad; si no, se intenta responder de nuevo.
 */
export async function finishSession(page: Page, maxSteps = 160): Promise<void> {
  let lastActivity = "";

  for (let step = 0; step < maxSteps; step += 1) {
    const finished = await page
      .getByRole("heading", { name: /Mision cumplida/i })
      .isVisible()
      .catch(() => false);
    if (finished) return;

    // Al cambiar de actividad se reinicia el contador de intentos de la historia.
    const label =
      (await page
        .getByText(/Actividad \d+ de/i)
        .first()
        .textContent()) ?? "";
    if (label !== lastActivity) {
      lastActivity = label;
      quizAttempt = 0;
    }

    const continuar = page.getByRole("button", { name: /^Continuar$/i });
    if (
      await continuar
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await continuar.first().click();
      continue;
    }

    const answered = await answerCurrentActivity(page);
    if (!answered) await page.waitForTimeout(300);
  }

  await expect(page.getByRole("heading", { name: /Mision cumplida/i })).toBeVisible({
    timeout: 10_000,
  });
}
