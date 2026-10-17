import { requireOwnerId } from "@/server/auth/session";
import { requireQuery } from "@/server/http/request";
import { ok } from "@/server/http/respond";
import { apiRoute } from "@/server/http/route";
import { getWorldDetail } from "@/server/use-cases/catalog";

/** Detalle de un mundo: lecciones y progreso. */

export const dynamic = "force-dynamic";

export const GET = apiRoute<{ worldId: string }>(async ({ request, requestId, params }) => {
  const ownerId = await requireOwnerId();
  const profileId = requireQuery(request, "profileId");

  const detail = await getWorldDetail(ownerId, profileId, params.worldId);
  return ok(detail, requestId);
});
