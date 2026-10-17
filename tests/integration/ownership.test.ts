import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { ApiError } from "@/server/http/errors";
import { answerActivity } from "@/server/use-cases/answer";
import { getProgressSummary, getRewards } from "@/server/use-cases/progress";
import { getProfileForOwner, listProfilesForOwner } from "@/server/use-cases/profiles";

import { correctResponse, createTestProfile, findChoiceActivity, newAttemptId, newOwnerId } from "./fixtures";
import { disconnect, mongoAvailable, resetDatabase } from "./helpers";

const dbReady = await mongoAvailable();

describe.skipIf(!dbReady)("aislamiento entre dispositivos", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("un dispositivo no ve los perfiles de otro", async () => {
    const ownerA = newOwnerId();
    const ownerB = newOwnerId();
    await createTestProfile(ownerA);

    expect(await listProfilesForOwner(ownerA)).toHaveLength(1);
    expect(await listProfilesForOwner(ownerB)).toHaveLength(0);
  });

  it("leer un perfil ajeno responde NOT_FOUND aunque el id exista", async () => {
    const ownerA = newOwnerId();
    const ownerB = newOwnerId();
    const profile = await createTestProfile(ownerA);

    await expect(getProfileForOwner(ownerB, profile.id)).rejects.toBeInstanceOf(ApiError);
    await expect(getProfileForOwner(ownerB, profile.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    });
  });

  it("no se puede responder por un perfil ajeno", async () => {
    const ownerA = newOwnerId();
    const ownerB = newOwnerId();
    const profile = await createTestProfile(ownerA);
    const activity = findChoiceActivity();

    await expect(
      answerActivity({
        ownerId: ownerB,
        profileId: profile.id,
        activityId: activity.id,
        clientAttemptId: newAttemptId(),
        response: correctResponse(activity),
        attemptNumber: 1,
        durationMs: 100,
        hintUsed: false,
        isReview: false,
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("el resumen y las recompensas de un perfil ajeno responden NOT_FOUND", async () => {
    const ownerA = newOwnerId();
    const ownerB = newOwnerId();
    const profile = await createTestProfile(ownerA);

    await expect(getProgressSummary(ownerB, profile.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(getRewards(ownerB, profile.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("un perfil inexistente responde NOT_FOUND", async () => {
    const ownerId = newOwnerId();
    await expect(getProfileForOwner(ownerId, "no-existe")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
