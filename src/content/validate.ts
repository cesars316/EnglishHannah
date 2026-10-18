import { GAME } from "@/config/game";
import type { Activity, ChoiceOption, Lesson, VocabularyItem, World } from "@/types/content";
import type { Badge } from "@/types/content";

/**
 * Validacion del contenido pedagogico.
 *
 * Es una funcion pura para poder probarla con Vitest. El acceso al sistema de
 * archivos se inyecta mediante `fileExists`, de modo que la misma logica sirve
 * para el script (`scripts/validate-content.ts`) y para las pruebas.
 */

export type ContentIssue = {
  level: "error" | "warning";
  code: string;
  message: string;
};

export type ContentBundle = {
  worlds: readonly World[];
  lessons: readonly Lesson[];
  activities: readonly Activity[];
  vocabulary: readonly VocabularyItem[];
  badges: readonly Badge[];
};

export type ValidateOptions = {
  /** Comprueba si un recurso de `public/` existe. */
  fileExists: (path: string) => boolean;
};

function findDuplicates(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  return [...duplicates];
}

function optionIds(options: readonly ChoiceOption[]): string[] {
  return options.map((option) => option.id);
}

export function validateContent(bundle: ContentBundle, options: ValidateOptions): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const { worlds, lessons, activities, vocabulary, badges } = bundle;

  const error = (code: string, message: string): void => {
    issues.push({ level: "error", code, message });
  };
  const warn = (code: string, message: string): void => {
    issues.push({ level: "warning", code, message });
  };

  const worldIds = new Set(worlds.map((world) => world.id));
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const activityIds = new Set(activities.map((activity) => activity.id));
  const vocabularyIds = new Set(vocabulary.map((item) => item.id));
  const badgeIds = new Set(badges.map((badge) => badge.id));

  /* ------------------------------ identificadores ----------------------------- */

  for (const id of findDuplicates(worlds.map((world) => world.id))) {
    error("DUPLICATE_WORLD_ID", `El mundo "${id}" esta repetido.`);
  }
  for (const id of findDuplicates(lessons.map((lesson) => lesson.id))) {
    error("DUPLICATE_LESSON_ID", `La leccion "${id}" esta repetida.`);
  }
  for (const id of findDuplicates(activities.map((activity) => activity.id))) {
    error("DUPLICATE_ACTIVITY_ID", `La actividad "${id}" esta repetida.`);
  }
  for (const id of findDuplicates(vocabulary.map((item) => item.id))) {
    error("DUPLICATE_VOCABULARY_ID", `La palabra "${id}" esta repetida.`);
  }
  for (const id of findDuplicates(badges.map((badge) => badge.id))) {
    error("DUPLICATE_BADGE_ID", `La insignia "${id}" esta repetida.`);
  }

  /* --------------------------------- mundos ---------------------------------- */

  const worldOrders = worlds.map((world) => world.order);
  if (new Set(worldOrders).size !== worldOrders.length) {
    error("DUPLICATE_WORLD_ORDER", "Hay dos mundos con el mismo orden.");
  }

  for (const world of worlds) {
    if (!world.title.es.trim())
      error("MISSING_WORLD_TITLE", `El mundo "${world.id}" no tiene titulo.`);
    if (world.lessonIds.length === 0) {
      error("EMPTY_WORLD", `El mundo "${world.id}" no tiene lecciones.`);
    }
    if (!badgeIds.has(world.badgeId)) {
      error(
        "MISSING_BADGE",
        `El mundo "${world.id}" apunta a la insignia "${world.badgeId}", que no existe.`,
      );
    }
    for (const prerequisite of world.prerequisites) {
      if (!worldIds.has(prerequisite)) {
        error(
          "MISSING_PREREQUISITE",
          `El mundo "${world.id}" requiere "${prerequisite}", que no existe.`,
        );
      }
      if (prerequisite === world.id) {
        error("SELF_PREREQUISITE", `El mundo "${world.id}" se requiere a si mismo.`);
      }
    }
    for (const lessonId of world.lessonIds) {
      if (!lessonIds.has(lessonId)) {
        error(
          "MISSING_LESSON",
          `El mundo "${world.id}" incluye la leccion "${lessonId}", que no existe.`,
        );
      }
    }
  }

  /* -------------------------------- lecciones -------------------------------- */

  for (const world of worlds) {
    const worldLessons = lessons
      .filter((lesson) => lesson.worldId === world.id)
      .sort((a, b) => a.order - b.order);
    worldLessons.forEach((lesson, index) => {
      if (lesson.order !== index + 1) {
        warn(
          "LESSON_ORDER_GAP",
          `La leccion "${lesson.id}" tiene orden ${lesson.order}; se esperaba ${index + 1} en "${world.id}".`,
        );
      }
    });
  }

  for (const lesson of lessons) {
    if (!worldIds.has(lesson.worldId)) {
      error(
        "ORPHAN_LESSON",
        `La leccion "${lesson.id}" apunta al mundo "${lesson.worldId}", que no existe.`,
      );
    }
    if (!lesson.title.es.trim())
      error("MISSING_LESSON_TITLE", `La leccion "${lesson.id}" no tiene titulo.`);
    if (!lesson.intro.es.trim())
      error("MISSING_LESSON_INTRO", `La leccion "${lesson.id}" no tiene intro.`);
    if (lesson.objectives.length === 0) {
      warn("MISSING_OBJECTIVES", `La leccion "${lesson.id}" no declara objetivos.`);
    }
    if (lesson.activityIds.length === 0) {
      error("EMPTY_LESSON", `La leccion "${lesson.id}" no tiene actividades.`);
    }
    if (lesson.estimatedMinutes <= 0 || lesson.estimatedMinutes > 20) {
      warn(
        "UNREALISTIC_DURATION",
        `La leccion "${lesson.id}" declara ${lesson.estimatedMinutes} minutos.`,
      );
    }
    for (const activityId of lesson.activityIds) {
      if (!activityIds.has(activityId)) {
        error(
          "MISSING_ACTIVITY",
          `La leccion "${lesson.id}" incluye la actividad "${activityId}", que no existe.`,
        );
      }
    }
    for (const vocabularyId of lesson.vocabularyIds) {
      if (!vocabularyIds.has(vocabularyId)) {
        error(
          "MISSING_LESSON_VOCABULARY",
          `La leccion "${lesson.id}" usa la palabra "${vocabularyId}", que no existe.`,
        );
      }
    }
  }

  /* -------------------------------- palabras --------------------------------- */

  for (const item of vocabulary) {
    if (!worldIds.has(item.worldId)) {
      error(
        "ORPHAN_VOCABULARY",
        `La palabra "${item.id}" apunta al mundo "${item.worldId}", que no existe.`,
      );
    }
    if (!item.word.trim())
      error("MISSING_WORD", `La palabra "${item.id}" no tiene texto en ingles.`);
    if (!item.translation.trim())
      error("MISSING_TRANSLATION", `La palabra "${item.id}" no tiene traduccion.`);
    if (!item.phonetic.trim())
      error("MISSING_PHONETIC", `La palabra "${item.id}" no tiene ayuda de pronunciacion.`);
    if (item.acceptedAnswers.length === 0) {
      error("MISSING_ACCEPTED_ANSWERS", `La palabra "${item.id}" no acepta ninguna respuesta.`);
    }
    if (!item.acceptedAnswers.some((answer) => answer.toLowerCase() === item.word.toLowerCase())) {
      warn(
        "WORD_NOT_SELF_ACCEPTED",
        `La palabra "${item.id}" no incluye su propia forma escrita entre las respuestas aceptadas.`,
      );
    }
    if (!item.example.en.trim() || !item.example.es.trim()) {
      error("MISSING_EXAMPLE", `La palabra "${item.id}" no tiene ejemplo bilingue.`);
    }
    if (item.visual.kind === "image") {
      if (!options.fileExists(item.visual.src)) {
        error(
          "MISSING_VOCABULARY_ASSET",
          `La palabra "${item.id}" usa "${item.visual.src}", que no existe en public/.`,
        );
      }
      if (!item.visual.alt.trim()) {
        error("MISSING_ALT", `La palabra "${item.id}" usa una imagen sin texto alternativo.`);
      }
    }
    if (item.visual.kind === "color" && !/^#[0-9a-f]{6}$/i.test(item.visual.hex)) {
      error(
        "INVALID_COLOR",
        `La palabra "${item.id}" usa el color "${item.visual.hex}", que no es valido.`,
      );
    }
    if (item.visual.kind === "count" && (item.visual.count < 1 || item.visual.count > 30)) {
      error("INVALID_COUNT", `La palabra "${item.id}" usa un conteo fuera de rango.`);
    }
    if (item.audio !== null && !options.fileExists(item.audio)) {
      error(
        "MISSING_AUDIO",
        `La palabra "${item.id}" usa el audio "${item.audio}", que no existe.`,
      );
    }
  }

  /* ------------------------------- actividades ------------------------------- */

  for (const activity of activities) {
    const lesson = lessons.find((candidate) => candidate.id === activity.lessonId);
    if (!lesson) {
      error(
        "ORPHAN_ACTIVITY",
        `La actividad "${activity.id}" apunta a la leccion "${activity.lessonId}", que no existe.`,
      );
    } else if (lesson.worldId !== activity.worldId) {
      error(
        "ACTIVITY_WORLD_MISMATCH",
        `La actividad "${activity.id}" declara el mundo "${activity.worldId}" pero su leccion pertenece a "${lesson.worldId}".`,
      );
    }

    if (!activity.prompt.es.trim()) {
      error("MISSING_PROMPT", `La actividad "${activity.id}" no tiene enunciado en español.`);
    }
    if (!activity.instructions.es.trim()) {
      warn("MISSING_INSTRUCTIONS", `La actividad "${activity.id}" no tiene instrucciones.`);
    }
    if (activity.xp <= 0) {
      error("INVALID_XP", `La actividad "${activity.id}" tiene XP no positivo.`);
    }
    if (activity.vocabularyIds.length === 0) {
      warn(
        "ACTIVITY_WITHOUT_VOCABULARY",
        `La actividad "${activity.id}" no referencia ninguna palabra.`,
      );
    }
    for (const vocabularyId of activity.vocabularyIds) {
      if (!vocabularyIds.has(vocabularyId)) {
        error(
          "MISSING_ACTIVITY_VOCABULARY",
          `La actividad "${activity.id}" usa la palabra "${vocabularyId}", que no existe.`,
        );
      }
    }
    if (activity.audio !== null && !options.fileExists(activity.audio)) {
      error(
        "MISSING_ACTIVITY_AUDIO",
        `La actividad "${activity.id}" usa el audio "${activity.audio}", que no existe.`,
      );
    }

    const activityId: string = activity.id;

    switch (activity.type) {
      case "listen-and-choose": {
        const ids = optionIds(activity.content.options);
        if (ids.length < GAME.minOptionsPerActivity || ids.length > GAME.maxOptionsPerActivity) {
          error(
            "INVALID_OPTION_COUNT",
            `La actividad "${activity.id}" tiene ${ids.length} opciones.`,
          );
        }
        if (findDuplicates(ids).length > 0) {
          error(
            "DUPLICATE_OPTION_ID",
            `La actividad "${activity.id}" repite identificadores de opcion.`,
          );
        }
        if (!ids.includes(activity.answerKey.optionId)) {
          error(
            "ANSWER_NOT_IN_OPTIONS",
            `La respuesta de "${activity.id}" no esta entre sus opciones.`,
          );
        }
        if (!activity.content.stimulus.value.trim()) {
          error(
            "MISSING_STIMULUS",
            `La actividad "${activity.id}" no tiene estimulo que pronunciar o mostrar.`,
          );
        }
        break;
      }
      case "image-choice": {
        const ids = optionIds(activity.content.options);
        if (ids.length < GAME.minOptionsPerActivity || ids.length > GAME.maxOptionsPerActivity) {
          error(
            "INVALID_OPTION_COUNT",
            `La actividad "${activity.id}" tiene ${ids.length} opciones.`,
          );
        }
        if (findDuplicates(ids).length > 0) {
          error(
            "DUPLICATE_OPTION_ID",
            `La actividad "${activity.id}" repite identificadores de opcion.`,
          );
        }
        if (!ids.includes(activity.answerKey.optionId)) {
          error(
            "ANSWER_NOT_IN_OPTIONS",
            `La respuesta de "${activity.id}" no esta entre sus opciones.`,
          );
        }
        if (!activity.content.promptWord.trim()) {
          error(
            "MISSING_PROMPT_WORD",
            `La actividad "${activity.id}" no indica la palabra a buscar.`,
          );
        }
        break;
      }
      case "sentence-completion": {
        const ids = optionIds(activity.content.options);
        if (ids.length < GAME.minOptionsPerActivity || ids.length > GAME.maxOptionsPerActivity) {
          error(
            "INVALID_OPTION_COUNT",
            `La actividad "${activity.id}" tiene ${ids.length} opciones.`,
          );
        }
        if (findDuplicates(ids).length > 0) {
          error(
            "DUPLICATE_OPTION_ID",
            `La actividad "${activity.id}" repite identificadores de opcion.`,
          );
        }
        if (!ids.includes(activity.answerKey.optionId)) {
          error(
            "ANSWER_NOT_IN_OPTIONS",
            `La respuesta de "${activity.id}" no esta entre sus opciones.`,
          );
        }
        if (!activity.content.sentence.includes("___")) {
          error("MISSING_BLANK", `La frase de "${activity.id}" no tiene el hueco "___".`);
        }
        break;
      }
      case "matching-pairs": {
        const pairs = activity.content.pairs;
        if (pairs.length < 2) {
          error("TOO_FEW_PAIRS", `La actividad "${activity.id}" necesita al menos 2 parejas.`);
        }
        const leftIds = pairs.map((pair) => pair.left.id);
        const rightIds = pairs.map((pair) => pair.right.id);
        if (findDuplicates(leftIds).length > 0 || findDuplicates(rightIds).length > 0) {
          error(
            "DUPLICATE_PAIR_ID",
            `La actividad "${activity.id}" repite identificadores en una columna.`,
          );
        }
        if (activity.answerKey.pairs.length !== pairs.length) {
          error(
            "PAIR_COUNT_MISMATCH",
            `La actividad "${activity.id}" declara ${activity.answerKey.pairs.length} respuestas para ${pairs.length} parejas.`,
          );
        }
        for (const pair of activity.answerKey.pairs) {
          if (!leftIds.includes(pair.leftId) || !rightIds.includes(pair.rightId)) {
            error(
              "INVALID_PAIR_ANSWER",
              `La respuesta de "${activity.id}" referencia una pareja inexistente.`,
            );
          }
        }
        break;
      }
      case "word-builder": {
        if (!activity.answerKey.text.trim()) {
          error(
            "MISSING_ANSWER_TEXT",
            `La actividad "${activity.id}" no tiene texto de respuesta.`,
          );
        }
        if (activity.content.tokens.length === 0) {
          error("MISSING_TOKENS", `La actividad "${activity.id}" no tiene fichas para ordenar.`);
        }
        const required =
          activity.content.mode === "letters"
            ? activity.answerKey.text.replace(/\s/g, "").split("")
            : activity.answerKey.text.split(" ");
        for (const piece of required) {
          if (!activity.content.tokens.includes(piece)) {
            error(
              "TOKEN_NOT_AVAILABLE",
              `La actividad "${activity.id}" no ofrece la ficha "${piece}".`,
            );
          }
        }
        break;
      }
      case "speak-and-check": {
        if (activity.content.acceptedAnswers.length === 0) {
          error(
            "MISSING_ACCEPTED_ANSWERS",
            `La actividad "${activity.id}" no acepta ninguna respuesta hablada.`,
          );
        }
        break;
      }
      case "camera-hunt": {
        const fallbackIds = optionIds(activity.content.fallbackOptions);
        if (fallbackIds.length < GAME.minOptionsPerActivity) {
          error(
            "MISSING_FALLBACK",
            `La actividad "${activity.id}" necesita al menos ${GAME.minOptionsPerActivity} opciones sin camara.`,
          );
        }
        if (fallbackIds.length > 0 && !fallbackIds.includes(activity.answerKey.optionId)) {
          error(
            "ANSWER_NOT_IN_OPTIONS",
            `La respuesta de "${activity.id}" no esta entre las opciones sin camara.`,
          );
        }
        if (!activity.content.why.es.trim()) {
          warn(
            "MISSING_WHY",
            `La actividad "${activity.id}" no explica por que se fotografia ese objeto.`,
          );
        }
        break;
      }
      case "story-quiz": {
        const questions = activity.content.questions;
        const declaredAnswers = activity.answerKey.questions;
        if (questions.length === 0) {
          error("EMPTY_STORY_QUIZ", `La actividad "${activity.id}" no tiene preguntas.`);
        }
        if (declaredAnswers.length !== questions.length) {
          error(
            "QUIZ_COUNT_MISMATCH",
            `La actividad "${activity.id}" declara ${declaredAnswers.length} respuestas para ${questions.length} preguntas.`,
          );
        }
        const allOptionIds: string[] = [];
        for (const question of questions) {
          const ids = optionIds(question.options);
          allOptionIds.push(...ids);
          if (ids.length < GAME.minOptionsPerActivity || ids.length > GAME.maxOptionsPerActivity) {
            error(
              "INVALID_OPTION_COUNT",
              `La pregunta "${question.id}" de "${activity.id}" tiene ${ids.length} opciones.`,
            );
          }
          const declared = declaredAnswers.find((item) => item.questionId === question.id);
          if (!declared) {
            error(
              "QUIZ_ANSWER_MISSING",
              `La actividad "${activity.id}" no declara respuesta para la pregunta "${question.id}".`,
            );
          } else if (!ids.includes(declared.optionId)) {
            error(
              "ANSWER_NOT_IN_OPTIONS",
              `La pregunta "${question.id}" de "${activity.id}" no incluye su respuesta.`,
            );
          }
        }
        // Los identificadores deben ser unicos en toda la historia: la interfaz
        // resalta la solucion a partir de `evaluation.correctOptionIds`.
        if (findDuplicates(allOptionIds).length > 0) {
          error(
            "DUPLICATE_OPTION_ID",
            `La actividad "${activity.id}" repite identificadores de opcion entre sus preguntas.`,
          );
        }
        break;
      }
      default: {
        error("UNKNOWN_ACTIVITY_TYPE", `La actividad "${activityId}" tiene un tipo desconocido.`);
      }
    }
  }

  /* ---------------------------- cobertura curricular -------------------------- */

  for (const world of worlds) {
    const worldActivities = activities.filter((activity) => activity.worldId === world.id);
    if (worldActivities.length === 0) {
      error("WORLD_WITHOUT_ACTIVITIES", `El mundo "${world.id}" no tiene actividades.`);
      continue;
    }
    if (!worldActivities.some((activity) => activity.skill === "listening")) {
      error("MISSING_LISTENING", `El mundo "${world.id}" no tiene ninguna actividad de escucha.`);
    }
    if (
      !worldActivities.some(
        (activity) => activity.skill === "reading" || activity.skill === "vocabulary",
      )
    ) {
      error(
        "MISSING_READING",
        `El mundo "${world.id}" no tiene ninguna actividad de lectura o vocabulario.`,
      );
    }
  }

  for (const item of vocabulary) {
    const used = activities.some((activity) => activity.vocabularyIds.includes(item.id));
    if (!used) {
      warn("UNUSED_VOCABULARY", `La palabra "${item.id}" no aparece en ninguna actividad.`);
    }
  }

  return issues;
}

export function summarizeIssues(issues: readonly ContentIssue[]): {
  errors: number;
  warnings: number;
} {
  return {
    errors: issues.filter((issue) => issue.level === "error").length,
    warnings: issues.filter((issue) => issue.level === "warning").length,
  };
}
