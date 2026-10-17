import { LIMITS } from "@/config/game";
import { apiError, type ApiErrorDetail } from "@/server/http/errors";

/**
 * Lectura del cuerpo de la peticion con limite de tamano.
 *
 * Se comprueba `Content-Length` antes de leer y ademas el tamano real del texto:
 * asi una peticion sin cabecera (o mentirosa) tampoco puede agotar memoria.
 */

export async function readJsonBody(
  request: Request,
  maxBytes: number = LIMITS.maxRequestBodyBytes,
): Promise<unknown> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw apiError.payloadTooLarge();
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    throw apiError.validation([{ field: "body", message: "No se pudo leer el cuerpo." }]);
  }

  if (text.length > maxBytes) throw apiError.payloadTooLarge();
  if (text.trim() === "") {
    throw apiError.validation([{ field: "body", message: "El cuerpo esta vacio." }]);
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw apiError.validation([{ field: "body", message: "El cuerpo no es JSON valido." }]);
  }
}

/** Convierte los problemas de Zod al formato `details` de la API. */
export function zodDetails(
  issues: readonly { path: readonly PropertyKey[]; message: string }[],
): ApiErrorDetail[] {
  return issues.map((issue) => ({
    field: issue.path.map((segment) => String(segment)).join(".") || "body",
    message: issue.message,
  }));
}

/** Lee un parametro de la cadena de consulta. */
export function queryParam(request: Request, name: string): string | null {
  return new URL(request.url).searchParams.get(name);
}

/** Exige un parametro de la cadena de consulta. */
export function requireQuery(request: Request, name: string): string {
  const value = queryParam(request, name);
  if (!value || value.length === 0 || value.length > 120) {
    throw apiError.validation([{ field: name, message: `Falta el parametro ${name}.` }]);
  }
  return value;
}
