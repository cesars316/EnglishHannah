import { requireOwnerId, requireParentUnlocked } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { apiRoute } from "@/server/http/route";
import { exportProfileData } from "@/server/use-cases/privacy";

/**
 * Exportacion completa de los datos del perfil en JSON.
 *
 * Requiere la zona parental: son datos del menor y no deben salir de casa sin
 * que un adulto lo pida (ADR 0005).
 */

export const dynamic = "force-dynamic";

export const GET = apiRoute<{ profileId: string }>(async ({ requestId, params }) => {
  const ownerId = await requireOwnerId();
  await requireParentUnlocked(ownerId);

  const bundle = await exportProfileData(ownerId, params.profileId);

  return ok(bundle, requestId, {
    headers: {
      "Content-Disposition": `attachment; filename="english-quest-${params.profileId}.json"`,
    },
  });
});
