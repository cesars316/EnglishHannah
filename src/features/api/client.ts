import type { ApiErrorBody, ApiErrorCode, ApiResponse } from "@/types/api";

/**
 * Cliente HTTP de `/api/v1`.
 *
 * - Desenvuelve el sobre `{ data } | { error }` y devuelve `data`.
 * - Convierte cualquier fallo en `ApiClientError`, con el codigo de la API, para
 *   que la interfaz pueda reaccionar (por ejemplo, `PARENT_AUTH_REQUIRED`).
 * - Envia siempre la cookie de sesion (`same-origin`): el servidor es la
 *   autoridad y deduce el `ownerId` de la cookie firmada, nunca del cuerpo.
 */

const BASE = "/api/v1";

export class ApiClientError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details: { field: string; message: string }[];
  readonly retryAfterSeconds: number | null;

  constructor(params: {
    code: ApiErrorCode;
    message: string;
    status: number;
    details?: { field: string; message: string }[];
    retryAfterSeconds?: number | null;
  }) {
    super(params.message);
    this.name = "ApiClientError";
    this.code = params.code;
    this.status = params.status;
    this.details = params.details ?? [];
    this.retryAfterSeconds = params.retryAfterSeconds ?? null;
  }

  get isNetworkError(): boolean {
    return this.code === "DB_UNAVAILABLE";
  }
}

function toClientError(error: ApiErrorBody, status: number, retryAfter?: string | null): ApiClientError {
  return new ApiClientError({
    code: error.code,
    message: error.message,
    status,
    details: error.details,
    retryAfterSeconds: retryAfter ? Number(retryAfter) || null : null,
  });
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      credentials: "same-origin",
      cache: "no-store",
      headers: init.body ? { "Content-Type": "application/json" } : undefined,
      ...init,
    });
  } catch {
    throw new ApiClientError({
      code: "DB_UNAVAILABLE",
      message: "No hay conexion con el servidor. Intentalo otra vez.",
      status: 0,
    });
  }

  let body: ApiResponse<T> | null = null;
  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    body = null;
  }

  if (body && "error" in body) {
    throw toClientError(body.error, response.status, response.headers.get("Retry-After"));
  }

  if (!response.ok || !body) {
    throw new ApiClientError({
      code: "INTERNAL_ERROR",
      message: "El servidor no respondio como esperabamos.",
      status: response.status,
    });
  }

  return body.data;
}

export const api = {
  get: <T>(path: string): Promise<T> => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body: unknown): Promise<T> =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string): Promise<T> => request<T>(path, { method: "DELETE" }),
};

/** Codigos que significan "la sesion o el permiso ya no valen". */
export function isAuthError(error: unknown): boolean {
  return (
    error instanceof ApiClientError &&
    (error.code === "PARENT_AUTH_REQUIRED" || error.code === "UNAUTHORIZED")
  );
}
