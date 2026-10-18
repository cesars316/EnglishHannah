import { normalizeAnswer } from "@/lib/normalize";
import type { Activity, ActivityEvaluation, ActivityResponse, ResponseKind } from "@/types/content";

/**
 * Evaluacion de respuestas. Funcion pura: mismas entradas, misma salida.
 *
 * No modifica la actividad ni la respuesta y nunca lanza por una respuesta
 * incorrecta: un error del jugador es un resultado, no una excepcion.
 */

/** Tipo de respuesta que la interfaz debe enviar para esta actividad. */
export function expectedResponseKind(activity: Activity): ResponseKind {
  switch (activity.type) {
    case "listen-and-choose":
    case "image-choice":
    case "sentence-completion":
    case "camera-hunt":
      return "choice";
    case "matching-pairs":
      return "pairs";
    case "word-builder":
      return "text";
    case "speak-and-check":
      return "speech";
    case "story-quiz":
      return "quiz";
    default:
      return "self-report";
  }
}

/** Respuestas que se aceptan por participacion, sin corregir (fallback amable). */
function selfReported(correctOptionIds: string[] = []): ActivityEvaluation {
  return { isCorrect: true, correctOptionIds, selfReported: true };
}

/** Respuesta incorrecta con las opciones correctas, para poder mostrarlas. */
function incorrect(
  correctOptionIds: string[],
  extra: Partial<ActivityEvaluation> = {},
): ActivityEvaluation {
  return { isCorrect: false, correctOptionIds, ...extra };
}

function evaluateChoice(answerId: string, response: ActivityResponse): ActivityEvaluation {
  if (response.kind === "self-report") return selfReported([answerId]);
  if (response.kind !== "choice") return incorrect([answerId]);
  return {
    isCorrect: response.optionId === answerId,
    correctOptionIds: [answerId],
  };
}

function evaluatePairs(
  activity: Extract<Activity, { type: "matching-pairs" }>,
  response: ActivityResponse,
): ActivityEvaluation {
  const expected = activity.answerKey.pairs;
  const correctPairs = expected.map((pair) => ({ leftId: pair.leftId, rightId: pair.rightId }));

  if (response.kind === "self-report") return selfReported();
  if (response.kind !== "pairs") return incorrect([], { correctPairs });

  const given = new Map(response.pairs.map((pair) => [pair.leftId, pair.rightId]));
  const isCorrect =
    given.size === expected.length &&
    expected.every((pair) => given.get(pair.leftId) === pair.rightId);

  return { isCorrect, correctOptionIds: expected.map((pair) => pair.rightId), correctPairs };
}

function evaluateText(
  activity: Extract<Activity, { type: "word-builder" }>,
  response: ActivityResponse,
): ActivityEvaluation {
  const expectedText = activity.answerKey.text;
  if (response.kind === "self-report") return selfReported();
  if (response.kind !== "text") return incorrect([], { expectedText });

  return {
    isCorrect: normalizeAnswer(response.text) === normalizeAnswer(expectedText),
    correctOptionIds: [],
    expectedText,
  };
}

function evaluateSpeech(
  activity: Extract<Activity, { type: "speak-and-check" }>,
  response: ActivityResponse,
): ActivityEvaluation {
  const accepted = activity.answerKey.acceptedAnswers;
  const expectedText = activity.content.target;

  if (response.kind === "self-report") return selfReported();
  if (response.kind !== "speech") return incorrect([], { expectedText });

  const transcript = response.transcript;
  // Sin transcripcion (microfono no disponible) se acepta el intento: nunca
  // se castiga a quien no puede usar el microfono (seccion 4.4 del documento).
  if (transcript === null)
    return { isCorrect: true, correctOptionIds: [], expectedText, selfReported: true };

  const normalized = normalizeAnswer(transcript);
  const isCorrect = accepted.some((candidate) => normalizeAnswer(candidate) === normalized);
  return { isCorrect, correctOptionIds: [], expectedText };
}

function evaluateStoryQuiz(
  activity: Extract<Activity, { type: "story-quiz" }>,
  response: ActivityResponse,
): ActivityEvaluation {
  const expected = activity.answerKey.questions;
  const correctOptionIds = expected.map((question) => question.optionId);
  if (response.kind === "self-report") return selfReported(correctOptionIds);
  if (response.kind !== "quiz") return incorrect(correctOptionIds);

  const given = new Map(response.answers.map((answer) => [answer.questionId, answer.optionId]));
  const quizResults = expected.map((question) => {
    const optionId = given.get(question.questionId) ?? "";
    return { questionId: question.questionId, optionId, isCorrect: optionId === question.optionId };
  });

  return {
    isCorrect: quizResults.every((result) => result.isCorrect),
    correctOptionIds,
    quizResults,
  };
}

export function evaluateActivity(
  activity: Activity,
  response: ActivityResponse,
): ActivityEvaluation {
  switch (activity.type) {
    case "listen-and-choose":
    case "image-choice":
    case "sentence-completion":
    case "camera-hunt":
      return evaluateChoice(activity.answerKey.optionId, response);
    case "matching-pairs":
      return evaluatePairs(activity, response);
    case "word-builder":
      return evaluateText(activity, response);
    case "speak-and-check":
      return evaluateSpeech(activity, response);
    case "story-quiz":
      return evaluateStoryQuiz(activity, response);
    default:
      return selfReported();
  }
}
