"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ActivityFrame } from "@/components/activities/activity-frame";
import { SpeakButton } from "@/components/activities/speak-button";
import type { SpeakAndCheckViewProps } from "@/components/activities/types";
import {
  isSpeechRecognitionSupported,
  recognitionErrorLabel,
  startRecognition,
  type RecognitionErrorCode,
  type RecognitionHandle,
} from "@/features/speech/recognition";

type ListeningState = "idle" | "listening" | "done" | "error";

/**
 * `speak-and-check`: decir la palabra en voz alta.
 *
 * El microfono esta apagado por defecto y solo se usa si el adulto lo habilito.
 * Siempre hay salida:
 * - sin microfono o sin soporte -> alternativa manual «Ya lo dije»;
 * - si el navegador rechaza el permiso -> aviso claro y la misma alternativa.
 * El texto reconocido se compara en memoria y se descarta (ADR 0005).
 */
export function SpeakAndCheckView({
  activity,
  busy,
  solved,
  revealed,
  onSubmit,
  onHint,
  hintVisible,
  showTranslation,
  microphoneEnabled,
}: SpeakAndCheckViewProps) {
  const [state, setState] = useState<ListeningState>("idle");
  const [transcript, setTranscript] = useState("");
  const [errorCode, setErrorCode] = useState<RecognitionErrorCode | null>(null);
  const handleRef = useRef<RecognitionHandle | null>(null);

  const supported = isSpeechRecognitionSupported();
  const target = activity.content.target;
  const canUseMic = supported && microphoneEnabled;

  useEffect(() => {
    return () => handleRef.current?.stop();
  }, []);

  const stopListening = useCallback(() => {
    handleRef.current?.stop();
    handleRef.current = null;
  }, []);

  const listen = useCallback(() => {
    if (busy || solved) return;
    setTranscript("");
    setErrorCode(null);
    setState("listening");

    handleRef.current = startRecognition({
      onPartial: (text) => setTranscript(text),
      onFinal: (text) => {
        setTranscript(text);
        setState("done");
      },
      onError: (code) => {
        setErrorCode(code);
        setState("error");
      },
      onEnd: () => {
        handleRef.current = null;
        setState((previous) => (previous === "listening" ? "idle" : previous));
      },
    });
  }, [busy, solved]);

  const submitSpoken = (): void => {
    const spoken = transcript.trim();
    if (spoken.length === 0) return;
    stopListening();
    onSubmit({ kind: "speech", transcript: spoken });
  };

  const submitManual = (): void => {
    stopListening();
    onSubmit({ kind: "self-report", practiced: true });
  };

  const hint = activity.hints[0]?.es;

  return (
    <ActivityFrame
      prompt={showTranslation ? activity.prompt.es : activity.prompt.en}
      instructions={showTranslation ? activity.instructions.es : activity.instructions.en}
      hint={hint}
      hintVisible={hintVisible}
      onHint={activity.hints.length > 0 ? onHint : undefined}
      footer={
        <>
          <button
            type="button"
            onClick={submitSpoken}
            disabled={busy || solved || transcript.trim().length === 0}
            className="bg-brand-700 hover:bg-brand-800 inline-flex min-h-12 items-center gap-2 rounded-2xl px-6 text-base font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-55"
          >
            Comprobar
          </button>
          <button
            type="button"
            onClick={submitManual}
            disabled={busy || solved}
            className="border-cream-300 text-cream-800 hover:bg-cream-100 inline-flex min-h-12 items-center gap-2 rounded-2xl border-2 bg-white px-4 text-base font-bold transition disabled:cursor-not-allowed disabled:opacity-55"
          >
            Ya lo dije
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="border-cream-200 rounded-2xl border bg-white p-4 text-center">
          <p className="text-cream-600 text-sm font-bold uppercase tracking-wide">Di en ingles</p>
          <p className="text-cream-900 mt-1 text-3xl font-extrabold">{target}</p>
          {showTranslation && (
            <p className="text-cream-700 mt-1 text-sm">En español: {activity.content.translation}</p>
          )}
          <div className="mt-3">
            <SpeakButton text={target} label="Escuchar la palabra" variant="soft" />
          </div>
        </div>

        {canUseMic ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={state === "listening" ? stopListening : listen}
              disabled={busy || solved}
              aria-pressed={state === "listening"}
              className={
                state === "listening"
                  ? "inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 text-lg font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-55"
                  : "border-cream-300 text-cream-900 hover:bg-cream-100 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 bg-white px-6 text-lg font-bold transition disabled:cursor-not-allowed disabled:opacity-55"
              }
            >
              {state === "listening" ? "Escuchando… toca para parar" : "Hablar"}
            </button>

            {state === "listening" && (
              <p className="text-cream-700 text-center text-sm">Di la palabra con calma.</p>
            )}

            {transcript.length > 0 && (
              <div className="border-sky-200 rounded-2xl border bg-sky-50 p-3">
                <p className="text-cream-600 text-sm font-bold">Te he oido:</p>
                <p className="text-cream-900 text-lg font-bold">“{transcript}”</p>
              </div>
            )}

            {errorCode && (
              <div className="border-warning-200 rounded-2xl border bg-warning-50 p-3">
                <p className="text-cream-900 text-sm font-semibold">{recognitionErrorLabel(errorCode)}</p>
                <p className="text-cream-700 mt-1 text-sm">
                  No pasa nada: puedes responder con «Ya lo dije» sin perder la practica.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="border-cream-200 rounded-2xl border bg-cream-50 p-3">
            <p className="text-cream-900 text-sm font-semibold">
              {microphoneEnabled
                ? "Este navegador no reconoce voz."
                : "El microfono esta apagado para este perfil."}
            </p>
            <p className="text-cream-700 mt-1 text-sm">
              Puedes responder con «Ya lo dije» y seguir practicando. El microfono lo activa un adulto
              en la zona de adultos.
            </p>
          </div>
        )}

        {(solved || revealed) && (
          <div className="border-success-500/40 bg-success-50 space-y-2 rounded-2xl border p-3">
            <p className="text-success-900 text-base font-bold">
              Cada intento cuenta. Sigue practicando: {target}.
            </p>
            <SpeakButton text={target} label="Escuchar la palabra" variant="soft" />
          </div>
        )}
      </div>
    </ActivityFrame>
  );
}
