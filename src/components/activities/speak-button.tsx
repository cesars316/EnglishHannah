"use client";

import { Icon } from "@/components/ui/icon";
import { speak } from "@/features/speech/tts";
import { useSpeechSynthesisSupported } from "@/features/speech/use-speech-support";
import { cn } from "@/lib/cn";

export type SpeakButtonProps = {
  text: string;
  /** Etiqueta visible junto al icono. */
  label?: string;
  size?: "md" | "lg";
  variant?: "solid" | "soft";
  className?: string;
};

/**
 * Boton de escucha con la sintesis de voz del navegador.
 *
 * Si el navegador no puede hablar, el boton se desactiva y se muestra la palabra
 * escrita: siempre hay una alternativa al audio (seccion 4.4 del documento).
 */
export function SpeakButton({
  text,
  label = "Escuchar",
  size = "md",
  variant = "solid",
  className,
}: SpeakButtonProps) {
  const supported = useSpeechSynthesisSupported();

  if (!supported) {
    return (
      <span className="border-cream-300 bg-cream-100 text-cream-800 inline-flex max-w-xs items-center gap-2 rounded-2xl border-2 px-4 py-2 text-sm font-semibold">
        <Icon name="speakerOff" size={20} />
        <span>
          Este navegador no puede leer en voz alta. La palabra es{" "}
          <span className="font-extrabold">{text}</span>.
        </span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => speak(text)}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition active:translate-y-px",
        size === "lg" ? "min-h-14 px-6 text-lg" : "min-h-12 px-5 text-base",
        variant === "solid"
          ? "bg-sky-600 text-white shadow-sm hover:bg-sky-700"
          : "border-2 border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100",
        className,
      )}
    >
      <Icon name="speaker" size={size === "lg" ? 26 : 22} />
      <span>{label}</span>
    </button>
  );
}
