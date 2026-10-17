import { ensureOwnerId } from "@/server/auth/session";
import { apiError } from "@/server/http/errors";
import { readJsonBody, zodDetails } from "@/server/http/request";
import { ok } from "@/server/http/respond";
import { apiRoute } from "@/server/http/route";
import { answerActivity } from "@/server/use-cases/answer";
import { answerActivitySchema } from "@/server/validation/schemas";

/**
 * Corregir una respuesta y registrar el intento.
 *
 * Idempotente por `clientAttemptId`: repetir la peticion no duplica XP y
 * devuelve `duplicate: true` (ADR 0004).
 */

export const dynamic = "force-dynamic";

export const POST = apiRoute<{ activityId: string }>(async ({ request, requestId, params }) => {
  const ownerId = await ensureOwnerId();

  const parsed = answerActivitySchema.safeParse(await readJsonBody(request));
  if (!parsed.success) throw apiError.validation(zodDetails(parsed.error.issues));

  const { profileId, ...rest } = parsed.data;
  const result = await answerActivity({ ownerId, profileId, activityId: params.activityId, ...rest });

  return ok(result, requestId);
});
