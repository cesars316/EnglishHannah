import { GAME } from "@/config/game";
import { getBadge, getVocabularyItem } from "@/content";
import { toPublicActivities } from "@/features/activities/engine/public-activity";
import { selectReviewActivities } from "@/features/activities/select";
import { computeChallenge } from "@/features/difficulty/logic";
import { pickReviewTargets, summarizeProgress } from "@/features/progress/logic";
import { serverNow } from "@/server/clock";
import { toAttempt, toGameState, toProgressRecord } from "@/server/db/mappers";
import { listAttempts } from "@/server/repositories/attempts";
import { ensureGameState } from "@/server/repositories/game-state";
import { listProgress } from "@/server/repositories/progress";
import { profileContext } from "@/server/use-cases/common";

import type { ReviewPlan, RewardsView } from "@/types/api";
import type { Badge } from "@/types/content";
import type { ProgressSummary } from "@/types/domain";

export type { ReviewPlan, RewardsView };
/** Lecturas agregadas de progreso, repaso e insignias. */

export async function getProgressSummary(
  ownerId: string,
  profileId: string,
  now: Date = serverNow(),
): Promise<ProgressSummary> {
  const { db } = await profileContext(ownerId, profileId);

  const [state, records, attempts] = await Promise.all([
    ensureGameState(db, profileId),
    listProgress(db, profileId),
    listAttempts(db, profileId),
  ]);

  return summarizeProgress({
    gameState: toGameState(state),
    records: records.map(toProgressRecord),
    attempts: attempts.map(toAttempt),
    now,
    reviewLimit: GAME.maxReviewSuggestions,
  });
}

export async function getReviewPlan(
  ownerId: string,
  profileId: string,
  now: Date = serverNow(),
): Promise<ReviewPlan> {
  const { db } = await profileContext(ownerId, profileId);

  const [progressRows, attemptRows] = await Promise.all([
    listProgress(db, profileId),
    listAttempts(db, profileId),
  ]);
  const records = progressRows.map(toProgressRecord);
  const attempts = attemptRows.map(toAttempt);

  // Ajuste de dificultad (Fase 7): el nivel sale del progreso persistido.
  const challenge = computeChallenge({ records, attempts });

  const targets = pickReviewTargets(records, now, GAME.maxReviewSuggestions);
  const vocabularyIds = targets.map((record) => record.entityId);

  // La sesion es corta, rota por tipo y se acerca al nivel que conviene.
  const activities = selectReviewActivities(vocabularyIds, GAME.activitiesPerSession, {
    preferredDifficulty: challenge.preferredDifficulty,
  });

  return { vocabularyIds, activities: toPublicActivities(activities), challenge };
}

export async function getRewards(ownerId: string, profileId: string): Promise<RewardsView> {
  const { db } = await profileContext(ownerId, profileId);
  const state = await ensureGameState(db, profileId);

  const badges = state.earnedBadgeIds
    .map((badgeId) => getBadge(badgeId))
    .filter((badge): badge is Badge => badge !== null);

  return { gameState: toGameState(state), badges };
}

/** Palabras distintas practicadas al menos una vez (para el panel parental). */
export async function getPracticedVocabularyIds(
  ownerId: string,
  profileId: string,
): Promise<string[]> {
  const { db } = await profileContext(ownerId, profileId);
  const records = await listProgress(db, profileId);
  return records
    .filter((record) => record.entityType === "vocabulary" && record.seenCount > 0)
    .map((record) => record.entityId)
    .filter((id) => getVocabularyItem(id) !== null);
}
