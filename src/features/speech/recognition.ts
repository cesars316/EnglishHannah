"use client";

import { SITE } from "@/config/game";

/**
 * Reconocimiento de voz del navegador (Web Speech API).
 *
 * Reglas de privacidad (ADR 0005):
 * - Solo se usa en el cliente.
 * - El texto reconocido se compara en memoria y se descarta; no se envia ni se
 *   guarda audio.
 * - El navegador puede delegar el audio a su proveedor: por eso el microfono
 *   esta apagado por defecto y siempre existe una alternativa manual.
 */

export type RecognitionErrorCode =
  | "not-allowed"
  | "no-speech"
  | "network"
  | "aborted"
  | "unsupported"
  | "unknown";

const ERROR_LABEL: Record<RecognitionErrorCode, string> = {
  "not-allowed": "El navegador no nos dejo usar el microfono. Puedes activarlo o responder sin el.",
  "no-speech": "No te oigo. Prueba de nuevo, mas cerca del microfono.",
  network: "El reconocimiento de voz no esta disponible ahora mismo. Puedes responder sin microfono.",
  aborted: "Escuchar se ha cancelado. Puedes intentarlo otra vez.",
  unsupported: "Este navegador no reconoce voz. Puedes responder escribiendo o con «Ya lo dije».",
  unknown: "Algo fallo al escuchar. Puedes responder sin microfono.",
};

export function recognitionErrorLabel(code: RecognitionErrorCode): string {
  return ERROR_LABEL[code];
}

/**
 * Traduce el nombre del error del navegador a nuestro codigo estable.
 *
 * Es puro para poder probarse sin un `SpeechRecognition` real.
 */
export function mapRecognitionError(name: string): RecognitionErrorCode {
  switch (name) {
    case "not-allowed":
    case "service-not-allowed":
      return "not-allowed";
    case "no-speech":
      return "no-speech";
    case "network":
    case "network-closed":
      return "network";
    case "aborted":
      return "aborted";
    default:
      return "unknown";
  }
}

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  const ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return typeof ctor === "function" ? (ctor as new () => SpeechRecognitionLike) : null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export type RecognitionHandlers = {
  /** Resultado final (ya con el texto completo). */
  onFinal: (transcript: string) => void;
  /** Resultado parcial mientras se habla. */
  onPartial?: (transcript: string) => void;
  onError: (code: RecognitionErrorCode) => void;
  onEnd: () => void;
};

export type RecognitionHandle = {
  stop: () => void;
};

/** Inicia una escucha unica. Devuelve un manejador para detenerla. */
export function startRecognition(handlers: RecognitionHandlers): RecognitionHandle | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    handlers.onError("unsupported");
    handlers.onEnd();
    return null;
  }

  let recognition: SpeechRecognitionLike;
  try {
    recognition = new Ctor();
  } catch {
    handlers.onError("unknown");
    handlers.onEnd();
    return null;
  }

  recognition.lang = SITE.targetLanguage;
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: unknown) => {
    const e = event as { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> };
    let finalText = "";
    let partialText = "";
    for (let i = 0; i < e.results.length; i += 1) {
      const result = e.results[i];
      if (!result) continue;
      const text = result[0]?.transcript ?? "";
      if (result.isFinal) finalText += text;
      else partialText += text;
    }
    if (partialText.length > 0) handlers.onPartial?.(partialText.trim());
    if (finalText.length > 0) handlers.onFinal(finalText.trim());
  };

  recognition.onerror = (event: { error?: string }) => {
    handlers.onError(mapRecognitionError(event.error ?? "unknown"));
  };

  recognition.onend = () => handlers.onEnd();

  try {
    recognition.start();
  } catch {
    handlers.onError("aborted");
    handlers.onEnd();
    return null;
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {
        /* noop */
      }
    },
  };
}

/** Elimina puntuacion y mayusculas para comparar lo dicho con lo esperado. */
export function normalizeSpeech(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
