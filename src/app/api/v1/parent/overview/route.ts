import { requireOwnerId, requireParentUnlocked } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { apiRoute } from "@/server/http/route";
import { getParentOverview } from "@/server/use-cases/parent";

/** Resumen familiar de todos los perfiles (requiere zona parental). */

export const dynamic = "force-dynamic";

export const GET = apiRoute(async ({ requestId }) => {
  const ownerId = await requireOwnerId();
  await requireParentUnlocked(ownerId);

  const profiles = await getParentOverview(ownerId);
  return ok({ profiles }, requestId);
});
