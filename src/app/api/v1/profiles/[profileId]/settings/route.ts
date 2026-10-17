import { requireOwnerId, requireParentUnlocked } from "@/server/auth/session";
import { apiError } from "@/server/http/errors";
import { readJsonBody, zodDetails } from "@/server/http/request";
import { ok } from "@/server/http/respond";
import { apiRoute } from "@/server/http/route";
import { updateProfileForOwner } from "@/server/use-cases/profiles";
import { updateProfileSettingsSchema } from "@/server/validation/schemas";

export const dynamic = "force-dynamic";

export const PATCH = apiRoute<{ profileId: string }>(async ({ request, requestId, params }) => {
  const ownerId = await requireOwnerId();
  await requireParentUnlocked(ownerId);
  const parsed = updateProfileSettingsSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) throw apiError.validation(zodDetails(parsed.error.issues));
  const profile = await updateProfileForOwner(ownerId, params.profileId, {
    settings: parsed.data.settings,
  });
  return ok({ profile }, requestId);
});
