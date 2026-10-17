import { SITE } from "@/config/game";

/**
 * Sintesis de voz del navegador (Web Speech API).
 *
 * Reglas de privacidad (ADR 0005):
 * - Solo se usa en el cliente.
 * - No se graba ni se envia audio: el texto se sintetiza localmente.
 * - Si no hay soporte, la interfaz muestra el texto (siempre hay alternativa).
 */

export function isSpeechSynthesisSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.speechSynthesis !== "undefined" &&
    typeof window.SpeechSynthesisUtterance === "function"
  );
}

/** Primera voz disponible en ingles, si el navegador la ofrece. */
export function findEnglishVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  const target = SITE.targetLanguage.toLowerCase();
  const prefix = target.slice(0, 2);
  return (
    voices.find((voice) => voice.lang.toLowerCase() === target) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith(prefix)) ??
    null
  );
}

export type SpeakOptions = {
  /** Velocidad; los niños pequenos agradecen algo mas lento que 1. */
  rate?: number;
  pitch?: number;
  /** Se llama cuando termina o falla la locucion. */
  onEnd?: () => void;
};

/**
 * Pronuncia `text` en ingles.
 * Devuelve `false` cuando el navegador no puede hablar, para que la interfaz
 * muestre el texto en su lugar.
 */
export function speak(text: string, options: SpeakOptions = {}): boolean {
  if (!isSpeechSynthesisSupported()) return false;

  const clean = text.trim();
  if (clean.length === 0) return false;

  try {
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(clean);
    utterance.lang = SITE.targetLanguage;
    utterance.rate = options.rate ?? 0.85;
    if (options.pitch !== undefined) utterance.pitch = options.pitch;

    const voice = findEnglishVoice();
    if (voice) utterance.voice = voice;

    if (options.onEnd) {
      utterance.onend = () => options.onEnd?.();
      utterance.onerror = () => options.onEnd?.();
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function cancelSpeech(): void {
  if (!isSpeechSynthesisSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* noop */
  }
}
