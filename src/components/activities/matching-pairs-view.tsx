"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ActivityFrame } from "@/components/activities/activity-frame";
import { OptionButton, type OptionState } from "@/components/activities/option-button";
import type { MatchingPairsViewProps } from "@/components/activities/types";
import { VocabularyVisualView } from "@/components/activities/vocabulary-visual";
import { cn } from "@/lib/cn";
import { shuffleWithSeed } from "@/lib/random";

/**
 * `matching-pairs`: se une cada palabra con su dibujo.
 *
 * Dos formas de emparejar, siempre disponibles:
 *
 * - Arrastrar (raton o dedo) una palabra y soltarla sobre su dibujo.
 * - Tocar la palabra y luego tocar el dibujo (funciona sin gestos y con
 *   teclado: cada pieza es un boton).
 *
 * El navegador nunca ve la solucion: se envia todo junto al pulsar
 * «Comprobar» y el servidor corrige. Las parejas ya acertadas quedan fijadas
 * entre intentos.
 */

/** Pieza colocada desde las pruebas: `data-testid="pair-item"` en cada boton. */
const PAIR_ITEM = "pair-item";

export function MatchingPairsView({
  activity,
  evaluation,
  busy,
  solved,
  revealed,
  onSubmit,
  onHint,
  hintVisible,
  showTranslation,
  lockedPairs,
}: MatchingPairsViewProps) {
  const lefts = useMemo(
    () =>
      shuffleWithSeed(
        activity.content.pairs.map((pair) => pair.left),
        `${activity.id}-left`,
      ),
    [activity],
  );
  const rights = useMemo(
    () =>
      shuffleWithSeed(
        activity.content.pairs.map((pair) => pair.right),
        `${activity.id}-right`,
      ),
    [activity],
  );

  const [assignment, setAssignment] = useState<Record<string, string>>(() =>
    Object.fromEntries(lockedPairs.map((pair) => [pair.leftId, pair.rightId])),
  );
  const [activeLeftId, setActiveLeftId] = useState<string | null>(null);
  /** Pieza que se esta arrastrando y posicion del puntero, para dibujarla. */
  const [drag, setDrag] = useState<{ leftId: string; x: number; y: number } | null>(null);
  /** Destino resaltado mientras se arrastra por encima. */
  const [hoverRightId, setHoverRightId] = useState<string | null>(null);
  /** True cuando el puntero se ha desplazado lo suficiente para iniciar arrastre. */
  const [dragMoved, setDragMoved] = useState(false);

  const rightRefs = useRef(new Map<string, HTMLButtonElement>());
  const justDropped = useRef(false);
  /** Un toque sin movimiento no debe romper el emparejamiento por toques. */
  const dragMovedRef = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const evalCorrectPairs = evaluation?.correctPairs;
  const correctByLeftId = useMemo(
    () => new Map((evalCorrectPairs ?? []).map((pair) => [pair.leftId, pair.rightId])),
    [evalCorrectPairs],
  );

  /** Las parejas acertadas segun el ultimo intento quedan fijadas. */
  const displayAssignment = useMemo(() => {
    const base: Record<string, string> = { ...assignment };
    if (!evalCorrectPairs?.length) return base;
    const next: Record<string, string> = {};
    for (const [leftId, rightId] of Object.entries(base)) {
      if (correctByLeftId.get(leftId) === rightId) next[leftId] = rightId;
    }
    return next;
  }, [assignment, correctByLeftId, evalCorrectPairs]);

  const assignedRightIds = new Set(Object.values(displayAssignment));
  const complete = lefts.every((left) => displayAssignment[left.id] !== undefined);

  /** rightId -> true si esta colocado en su pareja correcta. */
  const assignedCorrectly = new Map<string, boolean>();
  for (const [leftId, rightId] of Object.entries(displayAssignment)) {
    assignedCorrectly.set(rightId, correctByLeftId.get(leftId) === rightId);
  }

  const assign = (leftId: string, rightId: string): void => {
    setAssignment((previous) => {
      const next: Record<string, string> = {};
      // Un dibujo solo puede pertenecer a una palabra: se libera el anterior.
      for (const [key, value] of Object.entries(previous)) {
        if (value !== rightId) next[key] = value;
      }
      next[leftId] = rightId;
      return next;
    });
    setActiveLeftId(null);
    setHoverRightId(null);
  };

  const handleRight = (rightId: string): void => {
    // Un arrastre reciente ya coloco la ficha: el clic que dispara el navegador
    // al soltar no debe volver a moverla.
    if (justDropped.current) {
      justDropped.current = false;
      return;
    }
    if (activeLeftId === null) return;
    assign(activeLeftId, rightId);
  };

  const handleLeft = (leftId: string): void => {
    if (assignment[leftId] !== undefined) {
      setAssignment((previous) => {
        const next = { ...previous };
        delete next[leftId];
        return next;
      });
      setActiveLeftId(leftId);
      return;
    }
    setActiveLeftId((previous) => (previous === leftId ? null : leftId));
  };

  /** Dibujo que queda bajo el puntero (los botones no reciben eventos durante el arrastre). */
  const rightIdAtPoint = (x: number, y: number): string | null => {
    for (const [rightId, element] of rightRefs.current) {
      const box = element.getBoundingClientRect();
      if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) return rightId;
    }
    return null;
  };

  const startDrag = (leftId: string, x: number, y: number): void => {
    if (busy || solved) return;
    dragMovedRef.current = false;
    dragStart.current = { x, y };
    setDragMoved(false);
    setDrag({ leftId, x, y });
    setHoverRightId(null);
  };

  useEffect(() => {
    if (!drag) return;

    /** Margen para distinguir un toque (sin mover) de un arrastre real. */
    const DRAG_THRESHOLD = 6;

    const move = (event: PointerEvent): void => {
      if (!dragMovedRef.current) {
        const dx = Math.abs(event.clientX - dragStart.current.x);
        const dy = Math.abs(event.clientY - dragStart.current.y);
        if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) return;
        dragMovedRef.current = true;
        setDragMoved(true);
        setActiveLeftId(drag.leftId);
      }
      setDrag((previous) =>
        previous ? { ...previous, x: event.clientX, y: event.clientY } : previous,
      );
      setHoverRightId(rightIdAtPoint(event.clientX, event.clientY));
    };

    const finish = (event: PointerEvent): void => {
      const moved = dragMovedRef.current;
      const target =
        event.type === "pointerup" && moved
          ? rightIdAtPoint(event.clientX, event.clientY)
          : null;
      setDrag(null);
      setDragMoved(false);
      setHoverRightId(null);
      // Un toque sin movimiento deja la palabra activa: la vista completa el
      // emparejamiento cuando se toque el dibujo. Un arrastre limpia la
      // seleccion (salvo que se haya soltado sobre un dibujo).
      if (!moved) return;
      setActiveLeftId(null);
      if (target) {
        justDropped.current = true;
        assign(drag.leftId, target);
      }
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };
    // `assign` solo depende de los setters de estado, estables entre renders.
  }, [drag]);

  const submit = (): void => {
    const pairs = lefts
      .map((left) => ({ leftId: left.id, rightId: displayAssignment[left.id] }))
      .filter((pair): pair is { leftId: string; rightId: string } => pair.rightId !== undefined);
    onSubmit({ kind: "pairs", pairs });
  };

  const stateForRight = (rightId: string): OptionState => {
    if (solved) return evaluation?.correctOptionIds.includes(rightId) ? "correct" : "idle";
    if (assignedCorrectly.get(rightId) === true) return "correct";
    // Al revelarse la solucion se marcan los destinos correctos aunque no se
    // hayan colocado (la actividad termina y ya no se puede cambiar nada).
    if (revealed && evaluation?.correctOptionIds.includes(rightId)) return "correct";
    if (assignedRightIds.has(rightId)) return "selected";
    return "idle";
  };

  const dragSource = drag ? lefts.find((left) => left.id === drag.leftId) : undefined;

  /**
   * Nombre accesible de un dibujo. El SVG es decorativo cuando aun no se ha
   * resuelto (evita spoilers por lectores de pantalla), asi que el boton
   * necesita este texto para poder anunciarse.
   */
  const labelForRight = (rightId: string): string => {
    const right = rights.find((item) => item.id === rightId);
    if (!right) return rightId;
    if (right.label) return right.label;
    if (right.visual?.kind === "image") return right.visual.alt;
    if (right.visual?.kind === "color") return right.visual.alt;
    if (right.visual?.kind === "count") return right.visual.alt;
    return rightId;
  };

  return (
    <ActivityFrame
      prompt={showTranslation ? activity.prompt.es : activity.prompt.en}
      instructions={showTranslation ? activity.instructions.es : activity.instructions.en}
      hint={activity.hints[0]?.es}
      hintVisible={hintVisible}
      onHint={activity.hints.length > 0 ? onHint : undefined}
      footer={
        <>
          <button
            type="button"
            onClick={submit}
            disabled={!complete || busy || solved}
            className="bg-brand-700 hover:bg-brand-800 inline-flex min-h-12 items-center gap-2 rounded-2xl px-6 text-base font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-55"
          >
            Comprobar
          </button>
          {!complete && !solved && (
            <span className="text-cream-700 text-sm font-semibold">
              Une todas las parejas para comprobar.
            </span>
          )}
          {revealed && (
            <span className="text-success-900 text-sm font-bold">
              Solucion:{" "}
              {activity.content.pairs
                .map((pair) => `${pair.left.id} = ${pair.right.id}`)
                .join(" · ")}
            </span>
          )}
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-3" role="group" aria-label="Palabras">
          {lefts.map((left) => {
            const placedRightId = assignment[left.id];
            const isLocked =
              placedRightId !== undefined && correctByLeftId.get(left.id) === placedRightId;
            const isDragging = drag?.leftId === left.id && dragMoved;
            return (
              <div key={left.id} className="relative">
                <OptionButton
                  data-testid={PAIR_ITEM}
                  state={isLocked ? "correct" : activeLeftId === left.id ? "selected" : "idle"}
                  disabled={busy || solved || isLocked}
                  onClick={() => handleLeft(left.id)}
                  onPointerDown={(event) => {
                    if (isLocked) return;
                    // Solo el boton principal (o el dedo) arrastra.
                    if (event.pointerType === "mouse" && event.button !== 0) return;
                    startDrag(left.id, event.clientX, event.clientY);
                  }}
                  className={cn(
                    "min-h-16 cursor-grab touch-none select-none active:cursor-grabbing",
                    isDragging && "opacity-40",
                  )}
                >
                  <span className="text-lg">{left.label ?? left.id}</span>
                  {placedRightId !== undefined && !isLocked && (
                    <span className="text-cream-600 text-xs font-semibold">
                      Toca para cambiarlo
                    </span>
                  )}
                </OptionButton>
              </div>
            );
          })}
        </div>

        <div className="space-y-3" role="group" aria-label="Dibujos">
          {rights.map((right) => {
            const isTarget = hoverRightId === right.id && dragMoved && drag !== null;
            const isDropZone = activeLeftId !== null && !solved && !busy;
            return (
              <div
                key={right.id}
                className={cn("transition-transform duration-150", isTarget && "scale-[1.04]")}
              >
                <OptionButton
                  ref={(element) => {
                    if (element) rightRefs.current.set(right.id, element);
                    else rightRefs.current.delete(right.id);
                  }}
                  data-testid={PAIR_ITEM}
                  data-drop-target={isDropZone ? "true" : undefined}
                  state={stateForRight(right.id)}
                  disabled={busy || solved}
                  onClick={() => handleRight(right.id)}
                  srLabel={labelForRight(right.id)}
                  className={cn(
                    "min-h-16",
                    isDropZone && "border-dashed",
                    isTarget && "ring-brand-500 bg-brand-50 ring-4",
                  )}
                >
                  {right.visual ? (
                    <VocabularyVisualView
                      visual={right.visual}
                      size="md"
                      decorative={!(solved || revealed)}
                    />
                  ) : (
                    <span className="text-lg">{right.label ?? right.id}</span>
                  )}
                </OptionButton>
              </div>
            );
          })}
        </div>
      </div>

      {drag && dragMoved && dragSource && (
        <span
          aria-hidden="true"
          className="bg-cream-900/90 pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-2xl px-4 py-2 text-base font-bold text-white shadow-lg"
          style={{ left: drag.x, top: drag.y }}
        >
          {dragSource.label ?? dragSource.id}
        </span>
      )}
    </ActivityFrame>
  );
}
