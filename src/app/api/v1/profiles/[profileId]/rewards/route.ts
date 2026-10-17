import { requireOwnerId } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { apiRoute } from "@/server/http/route";
import { getRewards } from "@/server/use-cases/progress";

/** XP, monedas, mundos desbloqueados e insignias. */

export const dynamic = "force-dynamic";

export const GET = apiRoute<{ profileId: string }>(async ({ requestId, params }) => {
  const ownerId = await requireOwnerId();
  const rewards = await getRewards(ownerId, params.profileId);
  return ok(rewards, requestId);
});
