/** Constantes de juego, limites de interfaz y nombres de cookies. */

export const GAME = {
  minOptionsPerActivity: 3,
  maxOptionsPerActivity: 4,
  /** Actividades sugeridas por sesion (10-15 minutos). */
  activitiesPerSession: 6,
  /** Intentos permitidos por actividad antes de mostrar la solucion. */
  maxAttemptsPerActivity: 2,
  /** Numero maximo de palabras sugeridas para repaso. */
  maxReviewSuggestions: 8,
} as const;

/**
 * Umbrales del ajuste de dificultad segun progreso (Fase 7).
 *
 * Son aproximaciones pedagogicas, no evaluaciones cientificas: deciden que
 * tan retadora es la proxima sesion de repaso. El contenido no cambia; lo que
 * cambia es que actividades de dificultad 1, 2 o 3 se eligen primero.
 */
export const DIFFICULTY = {
  /** Intentos minimos antes de salir del nivel inicial (1 = mas suave). */
  minAttemptsToAdapt: 8,
  /** Precision (0-1) por debajo de la cual se baja a nivel inicial. */
  gentleAccuracy: 0.6,
  /** Precision minima y palabras dominadas para el nivel retador (3). */
  championAccuracy: 0.85,
  championMasteredWords: 12,
} as const;

export const LIMITS = {
  displayNameMin: 1,
  displayNameMax: 20,
  maxRequestBodyBytes: 64 * 1024,
  /** Intentos de codigo parental permitidos por ventana. */
  parentUnlockAttempts: 5,
  parentUnlockWindowMs: 5 * 60 * 1000,
  /** Perfiles maximos por dispositivo. */
  maxProfilesPerOwner: 5,
} as const;

export const COOKIES = {
  session: "eq_session",
  parent: "eq_parent",
} as const;

export const COOKIE_MAX_AGE_SECONDS = {
  session: 60 * 60 * 24 * 180,
  parent: 60 * 30,
} as const;

export const CONTENT_VERSION = 1;

export const SITE = {
  name: "English Quest",
  description:
    "Aventura educativa para aprender ingles A1 jugando. Sin publicidad y sin guardar datos sensibles.",
  supportLanguage: "es-CO",
  targetLanguage: "en-US",
} as const;
