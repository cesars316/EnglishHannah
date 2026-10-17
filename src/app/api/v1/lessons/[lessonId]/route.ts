import { requireOwnerId } from "@/server/auth/session";
import { requireQuery } from "@/server/http/request";
import { ok } from "@/server/http/respond";
import { apiRoute } from "@/server/http/route";
import { getLessonDetail } from "@/server/use-cases/catalog";

/**
 * Leccion con sus actividades PUBLICAS (sin `answerKey`) y su vocabulario.
 *
 * Es el endpoint que puede consumir un cliente sin acceso al contenido
 * versionado; la web usa Server Components y no lo necesita (ADR 0004).
 */

export const dynamic = "force-dynamic";

export const GET = apiRoute<{ lessonId: string }>(async ({ request, requestId, params }) => {
  const ownerId = await requireOwnerId();
  const profileId = requireQuery(request, "profileId");

  const detail = await getLessonDetail(ownerId, profileId, params.lessonId);
  return ok(detail, requestId);
});
