import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { REWARDS } from "@/config/rewards";
import { getRewards } from "@/server/use-cases/progress";
import { completeLesson } from "@/server/use-cases/completion";

import { createTestProfile, findChoiceActivity, newOwnerId } from "./fixtures";
import { disconnect, mongoAvailable, resetDatabase } from "./helpers";

const dbReady = await mongoAvailable();

describe.skipIf(!dbReady)("POST /lessons/:id/complete", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("otorga el bonus una sola vez", async () => {
    const ownerId = newOwnerId();
    const profile = await createTestProfile(ownerId);
    const activity = findChoiceActivity();

    const first = await completeLesson({ ownerId, profileId: profile.id, lessonId: activity.lessonId });

    expect(first.duplicate).toBe(false);
    expect(first.xpAwarded).toBeGreaterThanOrEqual(REWARDS.xpBonusLessonCompleted);
    expect(first.coinsAwarded).toBeGreaterThanOrEqual(REWARDS.coinsPerLessonCompleted);
    expect(first.gameState.completedLessonIds).toContain(activity.lessonId);

    const xpAfterFirst = first.gameState.xp;

    const second = await completeLesson({
      ownerId,
      profileId: profile.id,
      lessonId: activity.lessonId,
    });

    expect(second.duplicate).toBe(true);
    expect(second.xpAwarded).toBe(0);
    expect(second.coinsAwarded).toBe(0);
    expect(second.gameState.xp).toBe(xpAfterFirst);

    const rewards = await getRewards(ownerId, profile.id);
    expect(rewards.gameState.xp).toBe(xpAfterFirst);
  });

  it("una leccion inexistente responde NOT_FOUND", async () => {
    const ownerId = newOwnerId();
    const profile = await createTestProfile(ownerId);

    await expect(
      completeLesson({ ownerId, profileId: profile.id, lessonId: "leccion-fantasma" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
