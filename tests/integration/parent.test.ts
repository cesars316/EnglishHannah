import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { hashPasscode, verifyPasscodeHash } from "@/server/auth/passcode";
import { resetRateLimits } from "@/server/http/rate-limit";
import { getParentOverview, hasParentPasscode, setupParentPasscode, verifyParentPasscode } from "@/server/use-cases/parent";

import { createTestProfile, newOwnerId } from "./fixtures";
import { disconnect, mongoAvailable, resetDatabase } from "./helpers";

const dbReady = await mongoAvailable();

describe.skipIf(!dbReady)("zona parental", () => {
  beforeEach(async () => {
    await resetDatabase();
    resetRateLimits();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("deriva el codigo con scrypt y lo verifica sin guardarlo en claro", async () => {
    const credentials = await hashPasscode("bosque7");
    expect(credentials.hash).not.toContain("bosque7");
    expect(credentials.salt.length).toBeGreaterThan(0);

    expect(await verifyPasscodeHash("bosque7", credentials)).toBe(true);
    expect(await verifyPasscodeHash("otro", credentials)).toBe(false);
  });

  it("crea el codigo una sola vez", async () => {
    const ownerId = newOwnerId();
    expect(await hasParentPasscode(ownerId)).toBe(false);

    await setupParentPasscode(ownerId, "bosque7");
    expect(await hasParentPasscode(ownerId)).toBe(true);

    await expect(setupParentPasscode(ownerId, "otro123")).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });

  it("rechaza un codigo que no cumple el formato", async () => {
    const ownerId = newOwnerId();
    await expect(setupParentPasscode(ownerId, "1111")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
    await expect(setupParentPasscode(ownerId, "1")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });

  it("el codigo incorrecto no autoriza y el correcto si", async () => {
    const ownerId = newOwnerId();
    await setupParentPasscode(ownerId, "bosque7");

    await expect(verifyParentPasscode(ownerId, "incorrecto")).rejects.toMatchObject({
      code: "PARENT_AUTH_REQUIRED",
    });

    await expect(verifyParentPasscode(ownerId, "bosque7")).resolves.toBeUndefined();
  });

  it("limita los intentos de codigo (5 por ventana)", async () => {
    const ownerId = newOwnerId();
    await setupParentPasscode(ownerId, "bosque7");

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(verifyParentPasscode(ownerId, "incorrecto")).rejects.toMatchObject({
        code: "PARENT_AUTH_REQUIRED",
      });
    }

    await expect(verifyParentPasscode(ownerId, "bosque7")).rejects.toMatchObject({
      code: "RATE_LIMITED",
    });
  });

  it("el resumen familiar incluye a todos los perfiles del dispositivo", async () => {
    const ownerId = newOwnerId();
    await createTestProfile(ownerId);
    await createTestProfile(ownerId);

    const overview = await getParentOverview(ownerId);
    expect(overview).toHaveLength(2);
    expect(overview.every((entry) => entry.summary.xp === 0)).toBe(true);
  });
});
