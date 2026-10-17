import { GAME, LIMITS } from "@/config/game";
import { summarizeProgress } from "@/features/progress/logic";
import { validatePasscodeFormat } from "@/lib/passcode";
import { hashPasscode, verifyPasscodeHash } from "@/server/auth/passcode";
import { toAttempt, toGameState, toProfile, toProgressRecord } from "@/server/db/mappers";
import { apiError } from "@/server/http/errors";
import { checkRateLimit } from "@/server/http/rate-limit";
import { listAttempts } from "@/server/repositories/attempts";
import { ensureGameState } from "@/server/repositories/game-state";
import { getOwner, setParentPasscode } from "@/server/repositories/owners";
import { listProfiles } from "@/server/repositories/profiles";
import { listProgress } from "@/server/repositories/progress";
import { ownerContext } from "@/server/use-cases/common";

import type { ParentOverview } from "@/types/api";

export type { ParentOverview };
/**
 * Zona parental: codigo del adulto (scrypt + rate limiting) y resumen familiar.
 *
 * Estos casos de uso NO tocan cookies: la emision de `eq_parent` es
 * responsabilidad de la ruta (asi la logica es testeable sin contexto HTTP).
 * No hay PIN fijo en el codigo ni recuperacion por correo (ADR 0003).
 */

export async function hasParentPasscode(ownerId: string): Promise<boolean> {
  const { db } = await ownerContext(ownerId);
  const owner = await getOwner(db, ownerId);
  return Boolean(owner?.parentPasscodeHash && owner.parentPasscodeSalt);
}

/** Crea el codigo parental. Solo la primera vez. */
export async function setupParentPasscode(ownerId: string, passcode: string): Promise<void> {
  const format = validatePasscodeFormat(passcode);
  if (!format.ok) {
    throw apiError.validation([{ field: "passcode", message: format.message }]);
  }

  const { db } = await ownerContext(ownerId);
  const owner = await getOwner(db, ownerId);
  if (owner?.parentPasscodeHash) {
    throw apiError.conflict("Este dispositivo ya tiene un codigo de adulto.");
  }

  const credentials = await hashPasscode(passcode);
  await setParentPasscode(db, ownerId, credentials);
}

/**
 * Comprueba el codigo parental. Lanza si el codigo es incorrecto.
 *
 * Limitado a 5 intentos cada 5 minutos por sesion para frenar la fuerza bruta.
 */
export async function verifyParentPasscode(ownerId: string, passcode: string): Promise<void> {
  const limit = checkRateLimit(
    `parent-unlock:${ownerId}`,
    LIMITS.parentUnlockAttempts,
    LIMITS.parentUnlockWindowMs,
  );
  if (!limit.allowed) throw apiError.rateLimited(limit.retryAfterSeconds);

  const { db } = await ownerContext(ownerId);
  const owner = await getOwner(db, ownerId);

  if (!owner?.parentPasscodeHash || !owner.parentPasscodeSalt) {
    throw apiError.conflict("Todavia no hay un codigo de adulto en este dispositivo.");
  }

  const ok = await verifyPasscodeHash(passcode, {
    hash: owner.parentPasscodeHash,
    salt: owner.parentPasscodeSalt,
  });

  if (!ok) throw apiError.parentRequired();
}

/**
 * Cambia el codigo parental: exige el actual y guarda el nuevo.
 *
 * La ruta ya garantiza que la zona esta desbloqueada; aqui se vuelve a pedir el
 * codigo actual para que un niño que encuentre la sesion abierta no lo cambie.
 */
export async function changeParentPasscode(
  ownerId: string,
  currentPasscode: string,
  nextPasscode: string,
): Promise<void> {
  const format = validatePasscodeFormat(nextPasscode);
  if (!format.ok) {
    throw apiError.validation([{ field: "nextPasscode", message: format.message }]);
  }

  await verifyParentPasscode(ownerId, currentPasscode);

  const { db } = await ownerContext(ownerId);
  const credentials = await hashPasscode(nextPasscode);
  await setParentPasscode(db, ownerId, credentials);
}

/** Resumen de todos los perfiles del dispositivo (requiere zona parental). */
export async function getParentOverview(ownerId: string): Promise<ParentOverview[]> {
  const { db } = await ownerContext(ownerId);
  const profiles = await listProfiles(db, ownerId);
  const now = new Date();

  return Promise.all(
    profiles.map(async (profile) => {
      const [state, records, attempts] = await Promise.all([
        ensureGameState(db, profile._id),
        listProgress(db, profile._id),
        listAttempts(db, profile._id),
      ]);

      return {
        profile: toProfile(profile),
        summary: summarizeProgress({
          gameState: toGameState(state),
          records: records.map(toProgressRecord),
          attempts: attempts.map(toAttempt),
          now,
          reviewLimit: GAME.maxReviewSuggestions,
        }),
      };
    }),
  );
}
