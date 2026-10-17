import { ensureOwnerId, isParentUnlocked } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { apiRoute } from "@/server/http/route";
import { hasParentPasscode } from "@/server/use-cases/parent";

/** Estado de la zona parental: si hay codigo creado y si esta desbloqueada. */

export const dynamic = "force-dynamic";

export const GET = apiRoute(async ({ requestId }) => {
  const ownerId = await ensureOwnerId();
  const status = {
    hasPasscode: await hasParentPasscode(ownerId),
    unlocked: await isParentUnlocked(ownerId),
  };
  return ok(status, requestId);
});
