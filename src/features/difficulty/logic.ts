import { DIFFICULTY } from "@/config/game";
import type { ActivityAttempt, Challenge, ChallengeLevel, ProgressRecord } from "@/types/domain";
import type { Difficulty, LocalizedText } from "@/types/content";

/**
 * Ajuste de dificultad a partir del progreso (Fase 7 del documento maestro).
 *
 * El contenido es codigo versionado y NO cambia en ejecucion. Lo que se adapta
 * es la sesion de repaso: segun como le vaya a la nina, el servidor elige
 * primero actividades mas suaves (dificultad 1), normales (2) o retadoras (3).
 *
 * Es una aproximacion pedagogica amable:
 * - nunca sube de nivel solo por tiempo transcurrido;
 * - baja al instante si la precision reciente es baja;
 * - solo sube con evidencia suficiente (intentos + palabras dominadas).
 */

export type ChallengeInput = {
  records: readonly ProgressRecord[];
  attempts: readonly ActivityAttempt[];
};

export type { Challenge, ChallengeLevel };

const LEVELS: Record<ChallengeLevel, { preferredDifficulty: Difficulty; label: LocalizedText }> = {
  gentle: {
    preferredDifficulty: 1,
    label: { es: "Suave", en: "Gentle" },
  },
  steady: {
    preferredDifficulty: 2,
    label: { es: "Normal", en: "Steady" },
  },
  champion: {
    preferredDifficulty: 3,
    label: { es: "Retador", en: "Champion" },
  },
};

/**
 * Calcula el nivel de reto a partir del progreso persistido.
 *
 * Reglas, en orden:
 * 1. Sin intentos todavia -> nivel inicial (`gentle`).
 * 2. Pocos intentos (`minAttemptsToAdapt`) -> `gentle`, aun si la precision
 *    es perfecta: primero hay que consolidar.
 * 3. Precision por debajo de `gentleAccuracy` -> `gentle` (se baja ya).
 * 4. Precision >= `championAccuracy` y palabras dominadas suficientes ->
 *    `champion`.
 * 5. En cualquier otro caso -> `steady`.
 */
export function computeChallenge(input: ChallengeInput): Challenge {
  const vocabularyRecords = input.records.filter((record) => record.entityType === "vocabulary");
  const masteredWords = vocabularyRecords.filter((record) => record.status === "mastered").length;

  // Solo cuentan los intentos con respuesta clara; los auto-reportados no
  // suman ni restan precision porque no miden acierto.
  const scored = input.attempts.filter(
    (attempt) => attempt.result === "correct" || attempt.result === "incorrect",
  );
  const correct = scored.filter((attempt) => attempt.result === "correct").length;
  const accuracy = scored.length === 0 ? null : correct / scored.length;
  const attemptedActivities = input.attempts.length;

  const build = (level: ChallengeLevel, reason: LocalizedText): Challenge => ({
    level,
    preferredDifficulty: LEVELS[level].preferredDifficulty,
    label: LEVELS[level].label,
    accuracy,
    attemptedActivities,
    masteredWords,
    reason,
  });

  if (attemptedActivities === 0) {
    return build("gentle", {
      es: "Todavia no hay intentos registrados: empezamos con actividades suaves.",
      en: "There are no attempts yet: we start with gentle activities.",
    });
  }

  if (attemptedActivities < DIFFICULTY.minAttemptsToAdapt) {
    return build("gentle", {
      es: `Vamos con calma: llevas ${attemptedActivities} intentos. Practica un poco mas antes de subir de nivel.`,
      en: `Taking it easy: you have ${attemptedActivities} attempts. Practise a bit more before moving up.`,
    });
  }

  if (accuracy !== null && accuracy < DIFFICULTY.gentleAccuracy) {
    return build("gentle", {
      es: "Las ultimas respuestas costaron un poco: volvemos a actividades suaves para practicar.",
      en: "Recent answers were tricky: we go back to gentle activities to practise.",
    });
  }

  if (
    accuracy !== null &&
    accuracy >= DIFFICULTY.championAccuracy &&
    masteredWords >= DIFFICULTY.championMasteredWords
  ) {
    return build("champion", {
      es: "Te va muy bien y dominas muchas palabras: tocan retos mas grandes.",
      en: "You are doing great and know many words: time for bigger challenges.",
    });
  }

  return build("steady", {
    es: "Vas bien: mantenemos el nivel normal con un pequeño reto.",
    en: "You are doing well: we keep the steady level with a small challenge.",
  });
}
