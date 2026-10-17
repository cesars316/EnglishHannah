import { requireOwnerId, requireParentUnlocked } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { apiRoute } from "@/server/http/route";
import { getProgressSummary } from "@/server/use-cases/progress";
import { resetProfileProgressForOwner } from "@/server/use-cases/profiles";

/** Progreso agregado del perfil (panel y pantalla de coleccion). */

export const dynamic = "force-dynamic";

export const GET = apiRoute<{ profileId: string }>(async ({ requestId, params }) => {
  const ownerId = await requireOwnerId();
  const summary = await getProgressSummary(ownerId, params.profileId);
  return ok({ summary }, requestId);
});

/**
 * Reinicia el progreso de un perfil sin borrar el perfil.
 *
 * Accion destructiva: exige la zona parental desbloqueada. Se conservan el
 * nombre, el avatar y los ajustes.
 */
export const DELETE = apiRoute<{ profileId: string }>(async ({ requestId, params }) => {
  const ownerId = await requireOwnerId();
  await requireParentUnlocked(ownerId);
  await resetProfileProgressForOwner(ownerId, params.profileId);
  return ok({ reset: true }, requestId);
});
