import { ensureOwnerId } from "@/server/auth/session";
import { apiError } from "@/server/http/errors";
import { checkRateLimit } from "@/server/http/rate-limit";
import { readJsonBody, zodDetails } from "@/server/http/request";
import { ok } from "@/server/http/respond";
import { apiRoute } from "@/server/http/route";
import { createProfileForOwner, listProfilesForOwner } from "@/server/use-cases/profiles";
import { createProfileSchema } from "@/server/validation/schemas";

/** Lista y creacion de perfiles infantiles del dispositivo. */

export const dynamic = "force-dynamic";

export const GET = apiRoute(async ({ requestId }) => {
  const ownerId = await ensureOwnerId();
  const profiles = await listProfilesForOwner(ownerId);
  return ok({ profiles }, requestId);
});

export const POST = apiRoute(async ({ request, requestId }) => {
  const ownerId = await ensureOwnerId();

  const limit = checkRateLimit(`create-profile:${ownerId}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) throw apiError.rateLimited(limit.retryAfterSeconds);

  const parsed = createProfileSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) throw apiError.validation(zodDetails(parsed.error.issues));

  const profile = await createProfileForOwner(ownerId, parsed.data);
  return ok({ profile }, requestId, { status: 201 });
});
