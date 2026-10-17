import { revokeParentUnlock } from "@/server/auth/session";
import { ok } from "@/server/http/respond";
import { apiRoute } from "@/server/http/route";

/** Cierra la zona parental (borra `eq_parent`). No requiere sesion. */

export const dynamic = "force-dynamic";

export const POST = apiRoute(async ({ requestId }) => {
  await revokeParentUnlock();
  return ok({ unlocked: false }, requestId);
});
