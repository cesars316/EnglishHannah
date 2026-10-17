"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ActivityFrame } from "@/components/activities/activity-frame";
import { OptionButton } from "@/components/activities/option-button";
import { isOptionSelectable, resolveOptionState } from "@/components/activities/option-state";
import type { CameraHuntViewProps } from "@/components/activities/types";
import { VocabularyVisualView } from "@/components/activities/vocabulary-visual";
import {
  cameraErrorLabel,
  isCameraSupported,
  mapCameraError,
  startCamera,
  stopCamera,
  type CameraErrorCode,
} from "@/features/camera/camera";

type CameraState = "off" | "starting" | "on" | "error";

/**
 * `camera-hunt`: buscar un objeto mirando alrededor.
 *
 * La camara es solo una **vista previa en vivo**: no se captura, no se sube y no
 * se guarda nada (ADR 0005). Se apaga sola al salir y se puede apagar en
 * cualquier momento. Si no hay permiso o no hay camara, se responde con las
 * opciones de la lista, igual que con la camara apagada.
 */
export function CameraHuntView({
  activity,
  busy,
  solved,
  revealed,
  evaluation,
  eliminatedOptionIds,
  wrongOptionId,
  onSubmit,
  onHint,
  hintVisible,
  showTranslation,
  cameraEnabled,
}: CameraHuntViewProps) {
  const [state, setState] = useState<CameraState>("off");
  const [errorCode, setErrorCode] = useState<CameraErrorCode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const supported = isCameraSupported();
  const canUseCamera = supported && cameraEnabled;

  const shutdown = useCallback(() => {
    stopCamera(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => shutdown, [shutdown]);

  const turnOn = useCallback(async () => {
    if (busy || solved) return;
    setState("starting");
    setErrorCode(null);
    try {
      const stream = await startCamera();
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setState("on");
    } catch (error) {
      setErrorCode(mapCameraError(error));
      setState("error");
    }
  }, [busy, solved]);

  const turnOff = (): void => {
    shutdown();
    setState("off");
  };

  const options = activity.content.fallbackOptions;

  return (
    <ActivityFrame
      prompt={showTranslation ? activity.prompt.es : activity.prompt.en}
      instructions={showTranslation ? activity.instructions.es : activity.instructions.en}
      hint={activity.hints[0]?.es}
      hintVisible={hintVisible}
      onHint={activity.hints.length > 0 ? onHint : undefined}
    >
      <div className="space-y-3">
        {showTranslation && (
          <p className="text-cream-700 text-sm">
            En español: <span className="font-bold">{activity.content.translation}</span>
          </p>
        )}

        {canUseCamera && (
          <div className="space-y-2">
            {state === "on" ? (
              <div className="border-cream-300 relative overflow-hidden rounded-2xl border-2 bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="aspect-[4/3] w-full object-cover"
                  aria-label="Vista previa de la camara"
                />
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1">
                  <span className="bg-danger-500 inline-block size-2 rounded-full" aria-hidden="true" />
                  <span className="text-xs font-bold text-white">Camara encendida (solo mirar)</span>
                </div>
                <button
                  type="button"
                  onClick={turnOff}
                  className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white"
                >
                  Apagar camara
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={turnOn}
                disabled={busy || solved || state === "starting"}
                className="border-cream-300 text-cream-900 hover:bg-cream-100 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 bg-white px-6 text-lg font-bold transition disabled:cursor-not-allowed disabled:opacity-55"
              >
                {state === "starting" ? "Abriendo la camara…" : "Encender la camara"}
              </button>
            )}

            {state === "error" && errorCode && (
              <div className="border-warning-200 rounded-2xl border bg-warning-50 p-3">
                <p className="text-cream-900 text-sm font-semibold">{cameraErrorLabel(errorCode)}</p>
              </div>
            )}
          </div>
        )}

        {!canUseCamera && (
          <div className="border-cream-200 rounded-2xl border bg-cream-50 p-3">
            <p className="text-cream-900 text-sm font-semibold">
              {cameraEnabled
                ? "Este navegador no puede abrir la camara."
                : "La camara esta apagada para este perfil."}
            </p>
            <p className="text-cream-700 mt-1 text-sm">
              Elige la respuesta de la lista. El microfono y la camara los activa un adulto en la zona
              de adultos.
            </p>
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Elige la respuesta">
          {options.map((option) => {
            const state = resolveOptionState({
              optionId: option.id,
              eliminatedOptionIds,
              wrongOptionId,
              evaluation,
              solved,
              revealed,
            });
            const showLabel = solved || revealed;

            return (
              <OptionButton
                key={option.id}
                state={state}
                disabled={!isOptionSelectable(state, busy, solved)}
                srLabel={showLabel ? option.id : undefined}
                onClick={() => onSubmit({ kind: "choice", optionId: option.id })}
              >
                {option.visual ? (
                  <VocabularyVisualView visual={option.visual} size="lg" decorative={!showLabel} />
                ) : (
                  <span className="text-lg">{option.label ?? option.id}</span>
                )}
                {showLabel && <span className="text-cream-900 text-base">{option.id}</span>}
              </OptionButton>
            );
          })}
        </div>

        {(solved || revealed) && (
          <div className="border-success-500/40 bg-success-50 rounded-2xl border p-3">
            <p className="text-success-900 text-sm font-bold">
              ¡Bien encontrado! Sigue mirando alrededor: buscar objetos es practicar vocabulario.
            </p>
          </div>
        )}
      </div>
    </ActivityFrame>
  );
}
