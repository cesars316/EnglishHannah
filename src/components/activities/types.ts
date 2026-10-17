import type { ActivityEvaluation, ActivityResponse, PublicActivity } from "@/types/content";

/**
 * Props comunes a todas las vistas de actividad.
 *
 * Las vistas son presentacionales: no conocen el `answerKey` (se queda en el
 * servidor, ADR 0004). Solo pintan lo que el motor les devuelve en
 * `evaluation`.
 */
export type ActivityViewBase = {
  /** Opciones ya falladas: se atenuan y dejan de ser elegibles. */
  eliminatedOptionIds: readonly string[];
  /** Opcion elegida en el ultimo intento fallido. */
  wrongOptionId: string | null;
  /** Resultado del ultimo intento (null si aun no se ha respondido). */
  evaluation: ActivityEvaluation | null;
  /** Se esta corrigiendo en el servidor. */
  busy: boolean;
  /** La actividad ya se resolvio correctamente. */
  solved: boolean;
  /** Se agotaron los intentos: puede mostrarse la solucion. */
  revealed: boolean;
  onSubmit: (response: ActivityResponse) => void;
  onHint: () => void;
  hintVisible: boolean;
  /** Mostrar la ayuda en español (se puede desactivar para exigir mas ingles). */
  showTranslation: boolean;
};

export type ListenAndChooseViewProps = ActivityViewBase & {
  activity: Extract<PublicActivity, { type: "listen-and-choose" }>;
};

export type ImageChoiceViewProps = ActivityViewBase & {
  activity: Extract<PublicActivity, { type: "image-choice" }>;
};

export type SentenceCompletionViewProps = ActivityViewBase & {
  activity: Extract<PublicActivity, { type: "sentence-completion" }>;
};

export type MatchingPairsViewProps = ActivityViewBase & {
  activity: Extract<PublicActivity, { type: "matching-pairs" }>;
  /** Parejas ya acertadas en intentos anteriores (quedan fijadas). */
  lockedPairs: readonly { leftId: string; rightId: string }[];
};

export type WordBuilderViewProps = ActivityViewBase & {
  activity: Extract<PublicActivity, { type: "word-builder" }>;
};
