import { requireOwnerId } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { apiRoute } from "@/server/http/route";
import { getReviewPlan } from "@/server/use-cases/progress";

/** Palabras y actividades sugeridas para el bloque de repaso. */

export const dynamic = "force-dynamic";

export const GET = apiRoute<{ profileId: string }>(async ({ requestId, params }) => {
  const ownerId = await requireOwnerId();
  const plan = await getReviewPlan(ownerId, params.profileId);
  return ok(plan, requestId);
});
