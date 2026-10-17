import { randomUUID } from "node:crypto";

import type { ApiError, ApiErrorDetail } from "@/server/http/errors";
import type { ApiErrorCode, ApiFailure, ApiSuccess } from "@/types/api";

/**
 * Construccion de respuestas con el sobre comun.
 *
 * Todas las respuestas de `data` llevan `meta.requestId` para poder rastrear un
 * problema sin exponer detalles internos. Las que dependen del perfil jamas se
 * cachean.
 */

export function newRequestId(): string {
  return randomUUID();
}

export function jsonResponse(
  body: unknown,
  status: number,
  requestId: string,
  extraHeaders?: Record<string, string>,
): Response {
  const headers = new Headers(extraHeaders);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("X-Request-Id", requestId);
  return new Response(JSON.stringify(body), { status, headers });
}

export function ok<T>(
  data: T,
  requestId: string,
  init: { status?: number; headers?: Record<string, string> } = {},
): Response {
  const body: ApiSuccess<T> = { data, meta: { requestId } };
  return jsonResponse(body, init.status ?? 200, requestId, init.headers);
}

export function buildFailure(
  code: ApiErrorCode,
  message: string,
  requestId: string,
  details: ApiErrorDetail[],
): ApiFailure {
  return {
    error: {
      code,
      message,
      ...(details.length > 0 ? { details } : {}),
    },
    meta: { requestId },
  };
}

export function errorResponse(error: ApiError, requestId: string): Response {
  const headers: Record<string, string> = {};
  if (error.retryAfterSeconds) {
    headers["Retry-After"] = String(error.retryAfterSeconds);
  }
  return jsonResponse(
    buildFailure(error.code, error.message, requestId, error.details),
    error.status,
    requestId,
    headers,
  );
}
