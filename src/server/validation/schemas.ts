import { z } from "zod";

import { AVATARS } from "@/config/avatars";
import { LIMITS } from "@/config/game";
import { activityResponseSchema } from "@/features/activities/engine/activity-response";
import { PASSCODE_MAX_LENGTH, PASSCODE_MIN_LENGTH } from "@/lib/passcode";

/**
 * Esquemas de validacion de la API (Zod 4).
 *
 * Cada endpoint valida su cuerpo y sus parametros antes de tocar la base de
 * datos. Los errores se traducen al sobre `details` de `docs/API.md`.
 */

export const idSchema = z.string().min(1).max(120);

const avatarIds = new Set<string>(AVATARS.map((avatar) => avatar.id));
export const avatarIdSchema = z
  .string()
  .refine((value) => avatarIds.has(value), { message: "Ese avatar no existe." });

export const displayNameSchema = z
  .string()
  .trim()
  .min(LIMITS.displayNameMin, { message: "El alias no puede estar vacio." })
  .max(LIMITS.displayNameMax, { message: `Maximo ${LIMITS.displayNameMax} caracteres.` });

export const profileSettingsSchema = z
  .object({
    microphoneEnabled: z.boolean(),
    cameraEnabled: z.boolean(),
    soundEnabled: z.boolean(),
    reducedMotion: z.boolean(),
  })
  .partial();

export const createProfileSchema = z.object({
  displayName: displayNameSchema,
  avatarId: avatarIdSchema.optional(),
});

/** Cuerpo de `PATCH /profiles/:id/settings`: solo los ajustes del perfil. */
export const updateProfileSettingsSchema = z.object({
  settings: profileSettingsSchema,
});

export const updateProfileSchema = z
  .object({
    displayName: displayNameSchema.optional(),
    avatarId: avatarIdSchema.optional(),
    settings: profileSettingsSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Debes enviar al menos un campo a actualizar.",
  });

/** Identificador de intento generado por el navegador (UUID). */
export const clientAttemptIdSchema = z.uuid({ message: "clientAttemptId debe ser un UUID." });

export const answerActivitySchema = z.object({
  profileId: idSchema,
  clientAttemptId: clientAttemptIdSchema,
  response: activityResponseSchema,
  /** Intento dentro de la sesion (1 = primero). */
  attemptNumber: z.number().int().min(1).max(20),
  durationMs: z.number().int().min(0).max(60 * 60 * 1000),
  hintUsed: z.boolean(),
  isReview: z.boolean(),
});

export const completeLessonSchema = z.object({
  profileId: idSchema,
  clientAttemptId: clientAttemptIdSchema,
});

export const passcodeSchema = z
  .string()
  .min(PASSCODE_MIN_LENGTH, { message: `Usa al menos ${PASSCODE_MIN_LENGTH} caracteres.` })
  .max(PASSCODE_MAX_LENGTH, { message: `Maximo ${PASSCODE_MAX_LENGTH} caracteres.` });

export const parentSetupSchema = z.object({ passcode: passcodeSchema });
export const parentUnlockSchema = z.object({ passcode: passcodeSchema });
export const parentChangePasscodeSchema = z.object({
  currentPasscode: passcodeSchema,
  nextPasscode: passcodeSchema,
});
