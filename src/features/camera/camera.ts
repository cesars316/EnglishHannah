"use client";

/**
 * Camara del navegador (`getUserMedia`).
 *
 * Reglas de privacidad (ADR 0005):
 * - Solo se usa en el cliente y solo con permiso explicito.
 * - No se capturan fotogramas, no se sube ni se guarda nada: la camara sirve
 *   para ver y confirmar, nunca para grabar.
 * - Siempre hay un `stopCamera` que libera todas las pistas (`track.stop()`).
 */

export type CameraErrorCode = "denied" | "not-found" | "in-use" | "unsupported" | "unknown";

const ERROR_LABEL: Record<CameraErrorCode, string> = {
  denied: "El navegador no nos dejo usar la camara. Puedes hacer el reto sin ella.",
  "not-found": "No encontramos camara en este dispositivo. Hay una alternativa sin camara.",
  "in-use": "Otra aplicacion esta usando la camara. Cierrala e intenta de nuevo.",
  unsupported: "Este navegador no puede abrir la camara. Hay una alternativa sin camara.",
  unknown: "No pudimos abrir la camara. Hay una alternativa sin camara.",
};

export function cameraErrorLabel(code: CameraErrorCode): string {
  return ERROR_LABEL[code];
}

/**
 * Traduce el error de `getUserMedia` a nuestro codigo estable.
 *
 * Es puro para poder probarse sin pedir permiso de camara de verdad.
 */
export function mapCameraError(error: unknown): CameraErrorCode {
  const name =
    typeof error === "object" && error !== null && "name" in error
      ? String((error as { name: unknown }).name)
      : "";

  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return "denied";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "not-found";
    case "NotReadableError":
    case "TrackStartError":
    case "AbortError":
      return "in-use";
    default:
      return "unknown";
  }
}

export function isCameraSupported(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.mediaDevices?.getUserMedia === "function";
}

export type CameraOptions = {
  /** Solo video; nunca audio. */
  facingMode?: "user" | "environment";
};

/** Pide permiso y devuelve el flujo. El llamante debe liberarlo con `stopCamera`. */
export async function startCamera(options: CameraOptions = {}): Promise<MediaStream> {
  if (!isCameraSupported()) {
    throw new Error("unsupported");
  }
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: options.facingMode ?? "user" },
    audio: false,
  });
}

/** Detiene todas las pistas del flujo (libera el indicador del navegador). */
export function stopCamera(stream: MediaStream | null | undefined): void {
  if (!stream) return;
  for (const track of stream.getTracks()) {
    try {
      track.stop();
    } catch {
      /* noop */
    }
  }
}
