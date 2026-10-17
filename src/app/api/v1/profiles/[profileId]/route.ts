import { requireOwnerId, requireParentUnlocked } from "@/server/auth/session";
import { apiError } from "@/server/http/errors";
import { ok } from "@/server/http/respond";
import { apiRoute } from "@/server/http/route";
import { deleteProfileForOwner, getProfileForOwner, updateProfileForOwner } from "@/server/use-cases/profiles";
import { readJsonBody, zodDetails } from "@/server/http/request";
import { updateProfileSchema } from "@/server/validation/schemas";

export const dynamic = "force-dynamic";

export const GET = apiRoute<{ profileId: string }>(async ({ requestId, params }) => {
  const ownerId = await requireOwnerId();
  const profile = await getProfileForOwner(ownerId, params.profileId);
  return ok({ profile }, requestId);
});

export const PATCH = apiRoute<{ profileId: string }>(async ({ request, requestId, params }) => {
  const ownerId = await requireOwnerId();
  const parsed = updateProfileSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) throw apiError.validation(zodDetails(parsed.error.issues));
  const data = parsed.data;
  const profile = await updateProfileForOwner(ownerId, params.profileId, {
    displayName: data.displayName,
    avatarId: data.avatarId,
  });
  return ok({ profile }, requestId);
});

export const DELETE = apiRoute<{ profileId: string }>(async ({ requestId, params }) => {
  const ownerId = await requireOwnerId();
  await requireParentUnlocked(ownerId);
  await deleteProfileForOwner(ownerId, params.profileId);
  return ok({ deleted: true }, requestId);
});
