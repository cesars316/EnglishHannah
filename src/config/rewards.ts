/**
 * Valores de recompensa centralizados (documento maestro, seccion 6.1).
 * Los componentes NUNCA deben contener numeros magicos de XP o monedas.
 */
export const REWARDS = {
  /** Completar cualquier actividad. */
  xpPerActivityCompleted: 10,
  /** Bonus por acertar al primer intento. */
  xpBonusCorrectFirstTry: 5,
  /** Bonus por completar una leccion. */
  xpBonusLessonCompleted: 20,
  /** Bonus por terminar un mundo. */
  xpBonusWorldCompleted: 50,
  /** Recompensa por el esfuerzo en palabras dificiles (repaso). */
  xpBonusReviewEffort: 5,

  coinsPerActivityCompleted: 1,
  coinsPerLessonCompleted: 5,
  coinsPerWorldCompleted: 20,
} as const;

/**
 * Heuristica de dominio provisional (documento maestro, seccion 6.2).
 * Es una aproximacion pedagogica, no una evaluacion cientifica.
 *
 * Regla inicial: dominio provisional tras N aciertos repartidos en al menos
 * `requiredDistinctDays` sesiones y `requiredActivityTypes` tipos de actividad.
 * Un error posterior lo devuelve a `review`.
 */
export const MASTERY = {
  requiredCorrect: 4,
  requiredDistinctDays: 2,
  requiredActivityTypes: 2,
  /** Puntuacion de dominio necesaria para `mastered`. */
  masteredScore: 0.8,
  /** Umbral para `practicing`. */
  practicingScore: 0.45,
  /** Peso de cada acierto/error al actualizar la puntuacion. */
  correctWeight: 0.2,
  incorrectPenalty: 0.3,
} as const;

/** Intervalos de repaso espaciado simple, en dias (seccion 6.3). */
export const REVIEW_INTERVAL_DAYS = {
  afterError: 1,
  afterRecovery: 2,
  afterTwoSessions: 4,
  afterMastery: 14,
} as const;

/** Estados de animo del feedback amable. Nunca se penaliza al equivocarse. */
export const FEEDBACK = {
  correct: {
    es: "¡Muy bien! Great job!",
    en: "¡Muy bien! Great job!",
  },
  correctFirstTry: {
    es: "¡Perfecto a la primera! Well done!",
    en: "¡Perfecto a la primera! Well done!",
  },
  incorrect: {
    es: "¡Buen intento! Escuchemos otra vez.",
    en: "¡Buen intento! Escuchemos otra vez.",
  },
  selfReported: {
    es: "¡Gracias por intentarlo en voz alta!",
    en: "¡Gracias por intentarlo en voz alta!",
  },
} as const;
