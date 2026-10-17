import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { answerActivity } from "@/server/use-cases/answer";
import { getProgressSummary } from "@/server/use-cases/progress";
import { resetRateLimits } from "@/server/http/rate-limit";

import { createTestProfile, findChoiceActivity, newOwnerId } from "./fixtures";
import { disconnect, mongoAvailable, resetDatabase } from "./helpers";

const dbReady = await mongoAvailable();

describe.skipIf(!dbReady)("progreso y repaso", () => {
  beforeEach(async () => {
    await resetDatabase();
    resetRateLimits();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("genera resumen coherente con intentos reales", async () => {
    const ownerId = newOwnerId();
    const profile = await createTestProfile(ownerId);
    const activity = findChoiceActivity();
    if (activity.type !== "listen-and-choose") return;

    await answerActivity({
      ownerId,
      profileId: profile.id,
      activityId: activity.id,
      clientAttemptId: "pa1",
      response: { kind: "choice", optionId: activity.answerKey.optionId },
      attemptNumber: 1,
      hintUsed: false,
      isReview: false,
      durationMs: 1000,
    });

    const wrong = activity.content.options.find((o: { id: string }) => o.id !== activity.answerKey.optionId)?.id ?? activity.answerKey.optionId;
    await answerActivity({
      ownerId,
      profileId: profile.id,
      activityId: activity.id,
      clientAttemptId: "pa2",
      response: { kind: "choice", optionId: wrong },
      attemptNumber: 2,
      hintUsed: false,
      isReview: false,
      durationMs: 500,
    });

    const summary = await getProgressSummary(ownerId, profile.id, new Date("2026-10-17T12:00:00.000Z"));
    expect(summary.xp).toBeGreaterThan(0);
    expect(summary.coins).toBeGreaterThan(0);
    expect(summary.activitiesCompleted).toBeGreaterThanOrEqual(1);
    expect(summary.bySkill[activity.skill].attempts).toBe(2);
    expect(summary.bySkill[activity.skill].correct).toBe(1);
    expect(summary.minutesPracticed).toBe(0);
    expect(summary.recentActivity.length).toBeGreaterThan(0);
  });
});
