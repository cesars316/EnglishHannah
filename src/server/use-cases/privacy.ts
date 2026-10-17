import { CONTENT_VERSION } from "@/config/game";
import { toAttempt, toGameState, toProfile, toProgressRecord } from "@/server/db/mappers";
import { listAttempts } from "@/server/repositories/attempts";
import { ensureGameState } from "@/server/repositories/game-state";
import { listProgress } from "@/server/repositories/progress";
import { profileContext } from "@/server/use-cases/common";

import type { ExportBundle } from "@/types/api";

export type { ExportBundle };

/**
 * Exportacion de datos (derecho de acceso, documento maestro seccion 8).
 *
 * Se entrega TODO lo guardado de un perfil en un unico JSON legible. No hay
 * audio, fotos ni video que exportar: nunca se guardan (ADR 0005).
 */

export async function exportProfileData(
  ownerId: string,
  profileId: string,
): Promise<ExportBundle> {
  const { db, profile } = await profileContext(ownerId, profileId);

  const [state, records, attempts] = await Promise.all([
    ensureGameState(db, profileId),
    listProgress(db, profileId),
    listAttempts(db, profileId),
  ]);

  return {
    schemaVersion: CONTENT_VERSION,
    exportedAt: new Date().toISOString(),
    profile: toProfile(profile),
    gameState: toGameState(state),
    progress: records.map(toProgressRecord),
    attempts: attempts.map(toAttempt),
  };
}
