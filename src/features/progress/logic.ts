import { MASTERY, REVIEW_INTERVAL_DAYS } from "@/config/rewards";
import { getVocabularyItem, PUBLISHED_WORLDS } from "@/content";
import { computeChallenge } from "@/features/difficulty/logic";
import type {
  ActivityAttempt,
  GameState,
  MasteryStatus,
  ProgressEntityType,
  ProgressRecord,
  ProgressSummary,
} from "@/types/domain";
import type { Skill } from "@/types/content";

/**
 * Reglas de progreso: dominio provisional y repaso espaciado simple.
 *
 * Son funciones puras (mismas entradas => mismas salidas) para poder probarlas
 * sin navegador ni base de datos. En Fase 3 se ejecutan en el servidor sin
 * cambiar la firma de nadie.
 */

const SKILLS: readonly Skill[] = ["listening", "reading", "vocabulary", "speaking", "writing"];

export function makeProgressId(entityType: ProgressEntityType, entityId: string): string {
  return `${entityType}:${entityId}`;
}

/** Clave de dia local (`YYYY-MM-DD`), usada para contar sesiones distintas. */
export function dayKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function emptyProgressRecord(
  profileId: string,
  entityType: ProgressEntityType,
  entityId: string,
  now: Date,
): ProgressRecord {
  return {
    id: makeProgressId(entityType, entityId),
    profileId,
    entityType,
    entityId,
    status: "new",
    seenCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    activityTypesCompleted: [],
    distinctPracticeDays: 0,
    lastPracticedAt: null,
    nextReviewAt: null,
    masteryScore: 0,
    source: "session",
    updatedAt: now.toISOString(),
  };
}

export type ProgressOutcome = {
  profileId: string;
  entityType: ProgressEntityType;
  entityId: string;
  /** Tipo de actividad que genero el intento (`listen-and-choose`, ...). */
  activityType: string;
  activitySkill: Skill;
  correct: boolean;
  selfReported: boolean;
  source: "session" | "review" | "story";
  now: Date;
};

function deriveStatus(record: ProgressRecord): MasteryStatus {
  const enoughCorrect = record.correctCount >= MASTERY.requiredCorrect;
  const enoughDays = record.distinctPracticeDays >= MASTERY.requiredDistinctDays;
  const enoughTypes = record.activityTypesCompleted.length >= MASTERY.requiredActivityTypes;

  if (enoughCorrect && enoughDays && enoughTypes) {
    return record.masteryScore >= MASTERY.masteredScore ? "mastered" : "practicing";
  }
  if (record.correctCount > 0 && record.incorrectCount > 0) return "review";
  if (record.seenCount > 0) return "learning";
  return "new";
}

function computeNextReviewAt(record: ProgressRecord, now: Date): string {
  if (record.incorrectCount > 0 && record.correctCount === 0) {
    return addDays(now, REVIEW_INTERVAL_DAYS.afterError).toISOString();
  }
  if (record.status === "mastered") {
    return addDays(now, REVIEW_INTERVAL_DAYS.afterMastery).toISOString();
  }
  if (record.distinctPracticeDays >= 2) {
    return addDays(now, REVIEW_INTERVAL_DAYS.afterTwoSessions).toISOString();
  }
  return addDays(now, REVIEW_INTERVAL_DAYS.afterRecovery).toISOString();
}

/**
 * Aplica un intento sobre el registro existente (o crea uno nuevo).
 *
 * El dominio sube con cada acierto y baja un poco con cada error, pero un error
 * nunca borra el historial ni resta XP (documento maestro, seccion 6.2).
 */
export function applyOutcome(
  current: ProgressRecord | null,
  outcome: ProgressOutcome,
): ProgressRecord {
  const record = current
    ? { ...current }
    : emptyProgressRecord(outcome.profileId, outcome.entityType, outcome.entityId, outcome.now);

  const scored = outcome.correct || outcome.selfReported;
  const newDay =
    record.lastPracticedAt === null ||
    dayKey(new Date(record.lastPracticedAt)) !== dayKey(outcome.now);

  record.seenCount += 1;
  if (outcome.correct) record.correctCount += 1;
  if (!outcome.correct && !outcome.selfReported) record.incorrectCount += 1;

  if (!record.activityTypesCompleted.includes(outcome.activityType)) {
    record.activityTypesCompleted = [...record.activityTypesCompleted, outcome.activityType];
  }

  if (newDay && scored) record.distinctPracticeDays += 1;

  record.masteryScore = clamp(
    outcome.correct
      ? record.masteryScore + MASTERY.correctWeight
      : record.masteryScore - MASTERY.incorrectPenalty,
    0,
    1,
  );

  record.source = outcome.source;
  record.lastPracticedAt = outcome.now.toISOString();
  record.status = deriveStatus(record);
  record.nextReviewAt = computeNextReviewAt(record, outcome.now);
  record.updatedAt = outcome.now.toISOString();

  return record;
}

/** Registros de vocabulario que conviene repasar ahora. */
export function pickReviewTargets(
  records: readonly ProgressRecord[],
  now: Date,
  limit: number,
): ProgressRecord[] {
  const due = records
    .filter((record) => record.entityType === "vocabulary")
    .filter((record) => record.status !== "mastered")
    .filter((record) => {
      if (record.nextReviewAt === null) return true;
      return new Date(record.nextReviewAt).getTime() <= now.getTime();
    });

  const priority: Record<MasteryStatus, number> = {
    review: 0,
    learning: 1,
    new: 2,
    practicing: 3,
    mastered: 4,
  };

  return due
    .sort((a, b) => {
      const byPriority = priority[a.status] - priority[b.status];
      if (byPriority !== 0) return byPriority;
      return a.masteryScore - b.masteryScore;
    })
    .slice(0, limit);
}

export type SummaryInput = {
  gameState: GameState;
  records: readonly ProgressRecord[];
  attempts: readonly ActivityAttempt[];
  /** Fecha usada para decidir que repasar. */
  now: Date;
  reviewLimit: number;
};

/** Resumen agregado para el panel parental y la pantalla de coleccion. */
export function summarizeProgress(input: SummaryInput): ProgressSummary {
  const { gameState, records, attempts, now, reviewLimit } = input;

  const bySkill = Object.fromEntries(
    SKILLS.map((skill) => [skill, { attempts: 0, correct: 0 }]),
  ) as Record<Skill, { attempts: number; correct: number }>;

  let totalMs = 0;
  const worldsVisited = new Set<string>();

  for (const attempt of attempts) {
    totalMs += Number.isFinite(attempt.durationMs) ? attempt.durationMs : 0;
    worldsVisited.add(attempt.worldId);
    const bucket = bySkill[attempt.skill];
    bucket.attempts += 1;
    if (attempt.result === "correct") bucket.correct += 1;
  }

  const vocabularyRecords = records.filter((record) => record.entityType === "vocabulary");

  const reviewSuggestions = pickReviewTargets(records, now, reviewLimit).map((record) => {
    const item = getVocabularyItem(record.entityId);
    return {
      entityId: record.entityId,
      word: item?.word ?? record.entityId,
      translation: item?.translation ?? "",
      status: record.status,
      nextReviewAt: record.nextReviewAt,
    };
  });

  const recentActivity = [...attempts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map((attempt) => ({
      activityId: attempt.activityId,
      worldId: attempt.worldId,
      skill: attempt.skill,
      result: attempt.result,
      createdAt: attempt.createdAt,
    }));

  return {
    challenge: computeChallenge({ records, attempts }),
    xp: gameState.xp,
    coins: gameState.coins,
    activitiesCompleted: attempts.length,
    minutesPracticed: Math.round((totalMs / 60000) * 10) / 10,
    worldsVisited: worldsVisited.size,
    worldsCompleted: gameState.completedWorldIds.length,
    vocabularySeen: vocabularyRecords.filter((record) => record.seenCount > 0).length,
    vocabularyMastered: vocabularyRecords.filter((record) => record.status === "mastered").length,
    vocabulary: vocabularyRecords.map((record) => ({
      entityId: record.entityId,
      status: record.status,
      seenCount: record.seenCount,
      correctCount: record.correctCount,
    })),
    bySkill,
    reviewSuggestions,
    recentActivity,
    earnedBadgeIds: gameState.earnedBadgeIds,
  };
}

/** Numero total de mundos publicados (para barras de progreso globales). */
export const TOTAL_WORLDS = PUBLISHED_WORLDS.length;
