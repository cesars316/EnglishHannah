import { requireOwnerId } from "@/server/auth/session";
import { requireQuery } from "@/server/http/request";
import { ok } from "@/server/http/respond";
import { apiRoute } from "@/server/http/route";
import { listWorldSummaries } from "@/server/use-cases/catalog";

/**
 * Mundos publicados con su estado de desbloqueo.
 *
 * `?profileId=` es obligatorio para poder calcular el progreso: es lo que
 * distingue "mundo 3 disponible" de "mundo 3 bloqueado".
 */

export const dynamic = "force-dynamic";

export const GET = apiRoute(async ({ request, requestId }) => {
  const ownerId = await requireOwnerId();
  const profileId = requireQuery(request, "profileId");

  const worlds = await listWorldSummaries(ownerId, profileId);
  return ok({ worlds }, requestId);
});
