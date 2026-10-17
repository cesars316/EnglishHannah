import type { ApiErrorCode } from "@/types/api";

/**
 * Errores de la API.
 *
 * Toda la logica del servidor lanza `ApiError` y el envoltorio de ruta lo
 * convierte en el sobre de respuesta documentado en `docs/API.md`. Nunca se
 * filtran mensajes internos: los textos son los mismos para todos los casos.
 */

export const ERROR_STATUS: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  PARENT_AUTH_REQUIRED: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  RATE_LIMITED: 429,
  DB_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
};

export const DEFAULT_MESSAGES: Record<ApiErrorCode, string> = {
  VALIDATION_ERROR: "Revisa la informacion enviada.",
  UNAUTHORIZED: "Necesitas una sesion valida en este dispositivo.",
  PARENT_AUTH_REQUIRED: "Esta accion necesita el codigo de adulto.",
  NOT_FOUND: "No hemos encontrado lo que buscabas.",
  CONFLICT: "La operacion no es posible con el estado actual.",
  PAYLOAD_TOO_LARGE: "La peticion es demasiado grande.",
  RATE_LIMITED: "Demasiados intentos. Espera un momento.",
  DB_UNAVAILABLE: "El servicio no esta disponible en este momento.",
  INTERNAL_ERROR: "Algo no ha salido bien. Intentalo de nuevo.",
};

export type ApiErrorDetail = { field: string; message: string };

export type ApiErrorOptions = {
  details?: ApiErrorDetail[];
  retryAfterSeconds?: number;
  cause?: unknown;
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly details: ApiErrorDetail[];
  readonly retryAfterSeconds: number | null;

  constructor(code: ApiErrorCode, message?: string, options: ApiErrorOptions = {}) {
    super(message ?? DEFAULT_MESSAGES[code], { cause: options.cause });
    this.name = "ApiError";
    this.code = code;
    this.details = options.details ?? [];
    this.retryAfterSeconds = options.retryAfterSeconds ?? null;
    Error.captureStackTrace?.(this, ApiError);
  }

  get status(): number {
    return ERROR_STATUS[this.code];
  }
}

export const apiError = {
  validation: (details: ApiErrorDetail[] = [], message?: string): ApiError =>
    new ApiError("VALIDATION_ERROR", message, { details }),
  unauthorized: (message?: string): ApiError => new ApiError("UNAUTHORIZED", message),
  parentRequired: (): ApiError => new ApiError("PARENT_AUTH_REQUIRED"),
  notFound: (message?: string): ApiError => new ApiError("NOT_FOUND", message),
  conflict: (message?: string): ApiError => new ApiError("CONFLICT", message),
  rateLimited: (retryAfterSeconds: number): ApiError =>
    new ApiError("RATE_LIMITED", undefined, { retryAfterSeconds }),
  payloadTooLarge: (): ApiError => new ApiError("PAYLOAD_TOO_LARGE"),
  dbUnavailable: (cause?: unknown): ApiError => new ApiError("DB_UNAVAILABLE", undefined, { cause }),
  internal: (cause?: unknown): ApiError => new ApiError("INTERNAL_ERROR", undefined, { cause }),
};
