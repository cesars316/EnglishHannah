import { ensureOwnerId, grantParentUnlock, isParentUnlocked } from "@/server/auth/session";
import { apiError } from "@/server/http/errors";
import { readJsonBody, zodDetails } from "@/server/http/request";
import { ok } from "@/server/http/respond";
import { apiRoute } from "@/server/http/route";
import { setupParentPasscode } from "@/server/use-cases/parent";
import { parentSetupSchema } from "@/server/validation/schemas";

/**
 * Crea el codigo parental (solo la primera vez) y deja la zona desbloqueada.
 *
 * El codigo se guarda como `scrypt(codigo, sal)`; nunca en claro. Si ya existe,
 * responde `CONFLICT`.
 */

export const dynamic = "force-dynamic";

export const POST = apiRoute(async ({ request, requestId }) => {
  const ownerId = await ensureOwnerId();

  const parsed = parentSetupSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) throw apiError.validation(zodDetails(parsed.error.issues));

  await setupParentPasscode(ownerId, parsed.data.passcode);
  await grantParentUnlock(ownerId);

  return ok({ hasPasscode: true, unlocked: await isParentUnlocked(ownerId) }, requestId, {
    status: 201,
  });
});
