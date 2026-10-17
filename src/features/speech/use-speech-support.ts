"use client";

import { useSyncExternalStore } from "react";

import { isSpeechSynthesisSupported } from "@/features/speech/tts";

/** El soporte de audio no cambia durante la sesion: no hay nada que notificar. */
const subscribe = (): (() => void) => () => {};
const getServerSnapshot = (): boolean => false;

/**
 * Indica si el navegador puede sintetizar voz.
 *
 * Devuelve `false` en el servidor y el valor real tras la hidratacion, sin
 * provocar desajustes ni `setState` dentro de un efecto.
 */
export function useSpeechSynthesisSupported(): boolean {
  return useSyncExternalStore(subscribe, isSpeechSynthesisSupported, getServerSnapshot);
}
