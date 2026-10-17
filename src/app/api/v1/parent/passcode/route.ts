import { requireOwnerId, requireParentUnlocked } from "@/server/auth/session";
import { apiError } from "@/server/http/errors";
import { readJsonBody, zodDetails } from "@/server/http/request";
import { ok } from "@/server/http/respond";
import { apiRoute } from "@/server/http/route";
import { changeParentPasscode } from "@/server/use-cases/parent";
import { parentChangePasscodeSchema } from "@/server/validation/schemas";

/**
 * Cambia el codigo parental.
 *
 * Exige la zona desbloqueada Y el codigo actual: asi un niño que encuentre la
 * sesion abierta no puede cambiar la proteccion.
 */

export const dynamic = "force-dynamic";

export const POST = apiRoute(async ({ request, requestId }) => {
  const ownerId = await requireOwnerId();
  await requireParentUnlocked(ownerId);

  const parsed = parentChangePasscodeSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) throw apiError.validation(zodDetails(parsed.error.issues));

  await changeParentPasscode(ownerId, parsed.data.currentPasscode, parsed.data.nextPasscode);
  return ok({ hasPasscode: true, unlocked: true }, requestId);
});
