import { MongoError, MongoNetworkError, MongoServerSelectionError } from "mongodb";

import { ApiError, apiError } from "@/server/http/errors";
import { errorResponse, newRequestId } from "@/server/http/respond";

/**
 * Envoltorio de todas las rutas de la API.
 *
 * - Genera el `requestId` de la respuesta.
 * - Convierte cualquier excepcion en el sobre de error documentado.
 * - Traduce los fallos de MongoDB a `DB_UNAVAILABLE` (503) en vez de un 500 con
 *   traza, y registra el detalle solo en el servidor.
 */

type RouteParams = Record<string, string>;

export type ApiContext<P extends RouteParams> = {
  request: Request;
  requestId: string;
  params: P;
};

export function apiRoute<P extends RouteParams = Record<string, never>>(
  handler: (context: ApiContext<P>) => Promise<Response>,
): (request: Request, context: { params: Promise<P> } | undefined) => Promise<Response> {
  return async (request, context) => {
    const requestId = newRequestId();
    try {
      const params = context ? await context.params : ({} as P);
      return await handler({ request, requestId, params });
    } catch (error) {
      return toResponse(error, requestId);
    }
  };
}

function toResponse(error: unknown, requestId: string): Response {
  if (error instanceof ApiError) {
    return errorResponse(error, requestId);
  }

  if (isDatabaseError(error)) {
    console.error(`[api:${requestId}] base de datos no disponible:`, error);
    return errorResponse(apiError.dbUnavailable(error), requestId);
  }

  console.error(`[api:${requestId}] error inesperado:`, error);
  return errorResponse(apiError.internal(error), requestId);
}

function isDatabaseError(error: unknown): boolean {
  if (error instanceof MongoServerSelectionError) return true;
  if (error instanceof MongoNetworkError) return true;
  if (error instanceof MongoError) return true;
  // El driver lanza errores propios que no heredan de `MongoError` en todos los
  // casos; se reconocen por nombre para no depender de la version del driver.
  if (error instanceof Error && error.name.startsWith("Mongo")) return true;
  return false;
}
