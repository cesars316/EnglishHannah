import { ensureOwnerId, grantParentUnlock, isParentUnlocked } from "@/server/auth/session";
import { apiError } from "@/server/http/errors";
import { readJsonBody, zodDetails } from "@/server/http/request";
import { ok } from "@/server/http/respond";
import { apiRoute } from "@/server/http/route";
import { verifyParentPasscode } from "@/server/use-cases/parent";
import { parentUnlockSchema } from "@/server/validation/schemas";

/**
 * Verifica el codigo parental y emite la cookie `eq_parent` (30 minutos).
 *
 * Limitado a 5 intentos cada 5 minutos por sesion para frenar la fuerza bruta.
 */

export const dynamic = "force-dynamic";

export const POST = apiRoute(async ({ request, requestId }) => {
  const ownerId = await ensureOwnerId();

  const parsed = parentUnlockSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) throw apiError.validation(zodDetails(parsed.error.issues));

  await verifyParentPasscode(ownerId, parsed.data.passcode);
  await grantParentUnlock(ownerId);

  return ok({ hasPasscode: true, unlocked: await isParentUnlocked(ownerId) }, requestId);
});
