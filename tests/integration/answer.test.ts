import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { REWARDS } from "@/config/rewards";
import { answerActivity } from "@/server/use-cases/answer";
import { getLessonDetail, getWorldDetail } from "@/server/use-cases/catalog";
import { getProgressSummary, getRewards } from "@/server/use-cases/progress";

import {
  correctResponse,
  createTestProfile,
  findChoiceActivity,
  newAttemptId,
  newOwnerId,
  wrongResponse,
} from "./fixtures";
import { disconnect, mongoAvailable, resetDatabase } from "./helpers";

const dbReady = await mongoAvailable();

describe.skipIf(!dbReady)("POST /activities/:id/answer (caso de uso)", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("otorga bonus de primer intento y guarda el progreso", async () => {
    const ownerId = newOwnerId();
    const profile = await createTestProfile(ownerId);
    const activity = findChoiceActivity();

    const result = await answerActivity({
      ownerId,
      profileId: profile.id,
      activityId: activity.id,
      clientAttemptId: newAttemptId(),
      response: correctResponse(activity),
      attemptNumber: 1,
      durationMs: 1200,
      hintUsed: false,
      isReview: false,
    });

    expect(result.duplicate).toBe(false);
    expect(result.solved).toBe(true);
    expect(result.revealed).toBe(false);
    expect(result.xpAwarded).toBe(REWARDS.xpPerActivityCompleted + REWARDS.xpBonusCorrectFirstTry);
    expect(result.coinsAwarded).toBe(REWARDS.coinsPerActivityCompleted);
    expect(result.gameState.xp).toBe(result.xpAwarded);
    expect(result.totalAttempts).toBe(1);

    // El progreso persiste: una lectura nueva lo ve.
    const summary = await getProgressSummary(ownerId, profile.id);
    expect(summary.activitiesCompleted).toBe(1);
    expect(summary.vocabularySeen).toBeGreaterThan(0);
    expect(summary.xp).toBe(result.xpAwarded);
  });

  it("es idempotente: repetir el mismo clientAttemptId no duplica XP", async () => {
    const ownerId = newOwnerId();
    const profile = await createTestProfile(ownerId);
    const activity = findChoiceActivity();
    const clientAttemptId = newAttemptId();

    const payload = {
      ownerId,
      profileId: profile.id,
      activityId: activity.id,
      clientAttemptId,
      response: correctResponse(activity),
      attemptNumber: 1,
      durationMs: 900,
      hintUsed: false,
      isReview: false,
    } as const;

    const first = await answerActivity(payload);
    const second = await answerActivity(payload);

    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);
    expect(second.xpAwarded).toBe(first.xpAwarded);
    expect(second.gameState.xp).toBe(first.gameState.xp);
    expect(second.totalAttempts).toBe(1);

    const rewards = await getRewards(ownerId, profile.id);
    expect(rewards.gameState.xp).toBe(first.xpAwarded);
  });

  it("un fallo no resta y tras agotar los intentos se revela con premio de esfuerzo", async () => {
    const ownerId = newOwnerId();
    const profile = await createTestProfile(ownerId);
    const activity = findChoiceActivity();

    const withHint = await answerActivity({
      ownerId,
      profileId: profile.id,
      activityId: activity.id,
      clientAttemptId: newAttemptId(),
      response: wrongResponse(activity),
      attemptNumber: 1,
      durationMs: 1500,
      hintUsed: true,
      isReview: false,
    });

    expect(withHint.solved).toBe(false);
    expect(withHint.revealed).toBe(false);
    expect(withHint.xpAwarded).toBe(0);
    expect(withHint.coinsAwarded).toBe(0);
    expect(withHint.gameState.xp).toBe(0);

    const revealed = await answerActivity({
      ownerId,
      profileId: profile.id,
      activityId: activity.id,
      clientAttemptId: newAttemptId(),
      response: wrongResponse(activity),
      attemptNumber: 2,
      durationMs: 800,
      hintUsed: false,
      isReview: false,
    });

    expect(revealed.solved).toBe(false);
    expect(revealed.revealed).toBe(true);
    expect(revealed.xpAwarded).toBe(REWARDS.xpPerActivityCompleted);
    expect(revealed.coinsAwarded).toBe(REWARDS.coinsPerActivityCompleted);
    expect(revealed.gameState.xp).toBe(REWARDS.xpPerActivityCompleted);
  });

  it("no falla al reescribir el progreso ya existente (acierto y luego fallo)", async () => {
    const ownerId = newOwnerId();
    const profile = await createTestProfile(ownerId);
    const activity = findChoiceActivity();

    // Primer intento correcto: crea los documentos de progreso.
    const first = await answerActivity({
      ownerId,
      profileId: profile.id,
      activityId: activity.id,
      clientAttemptId: newAttemptId(),
      response: correctResponse(activity),
      attemptNumber: 1,
      durationMs: 700,
      hintUsed: false,
      isReview: false,
    });
    expect(first.solved).toBe(true);

    // Segundo intento fallido (revela): reescribe el MISMO progreso. Este caso
    // reprodujo un `E11000` porque el `id` de dominio se volvia a prefijar con
    // el perfil (`profileId:profileId:...`). Debe resolverse con normalidad.
    const second = await answerActivity({
      ownerId,
      profileId: profile.id,
      activityId: activity.id,
      clientAttemptId: newAttemptId(),
      response: wrongResponse(activity),
      attemptNumber: 2,
      durationMs: 600,
      hintUsed: false,
      isReview: false,
    });
    expect(second.revealed).toBe(true);

    const summary = await getProgressSummary(ownerId, profile.id);
    const repeated = summary.vocabulary.filter((item) => item.seenCount >= 2);
    expect(repeated.length).toBeGreaterThan(0);
    expect(repeated.some((item) => item.correctCount >= 1)).toBe(true);
  });

  it("la API de leccion nunca incluye el answerKey", async () => {
    const ownerId = newOwnerId();
    const profile = await createTestProfile(ownerId);
    const activity = findChoiceActivity();

    const detail = await getLessonDetail(ownerId, profile.id, activity.lessonId);
    expect(detail.activities.length).toBeGreaterThan(0);

    for (const item of detail.activities) {
      expect(Object.prototype.hasOwnProperty.call(item, "answerKey")).toBe(false);
    }
  });

  it("el detalle de mundo calcula desbloqueo por perfil", async () => {
    const ownerId = newOwnerId();
    const profile = await createTestProfile(ownerId);
    const activity = findChoiceActivity();

    const detail = await getWorldDetail(ownerId, profile.id, activity.worldId);
    expect(detail.world.id).toBe(activity.worldId);
    expect(detail.lessons.length).toBeGreaterThan(0);
    expect(detail.lessons.every((lesson) => lesson.completed === false)).toBe(true);
  });
});
