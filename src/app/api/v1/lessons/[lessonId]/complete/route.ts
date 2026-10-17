import { ensureOwnerId } from "@/server/auth/session";
import { apiError } from "@/server/http/errors";
import { readJsonBody, zodDetails } from "@/server/http/request";
import { ok } from "@/server/http/respond";
import { apiRoute } from "@/server/http/route";
import { completeLesson } from "@/server/use-cases/completion";
import { completeLessonSchema } from "@/server/validation/schemas";

/** Marca la leccion como completada y otorga el bonus UNA sola vez. */

export const dynamic = "force-dynamic";

export const POST = apiRoute<{ lessonId: string }>(async ({ request, requestId, params }) => {
  const ownerId = await ensureOwnerId();

  const parsed = completeLessonSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) throw apiError.validation(zodDetails(parsed.error.issues));

  const result = await completeLesson({
    ownerId,
    profileId: parsed.data.profileId,
    lessonId: params.lessonId,
  });

  return ok(result, requestId);
});
