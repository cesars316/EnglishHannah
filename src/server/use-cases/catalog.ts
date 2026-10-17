import {
  PUBLISHED_WORLDS,
  getLesson,
  getLessonActivities,
  getLessonVocabulary,
  getWorld,
  getWorldLessons,
} from "@/content";
import { toPublicActivities } from "@/features/activities/engine/public-activity";
import { toGameState } from "@/server/db/mappers";
import { apiError } from "@/server/http/errors";
import { ensureGameState } from "@/server/repositories/game-state";
import { profileContext } from "@/server/use-cases/common";

import type {
  LessonDetailView,
  LessonSummary,
  WorldDetailView,
  WorldSummary,
} from "@/types/api";
import type { Lesson, World } from "@/types/content";
import type { GameState } from "@/types/domain";

export type { LessonDetailView, LessonSummary, WorldDetailView, WorldSummary };

/**
 * Catalogo de mundos y lecciones.
 *
 * El contenido sigue siendo codigo versionado (ADR 0002): aqui solo se le anade
 * el estado de progreso del perfil. Las actividades SIEMPRE viajan sin
 * `answerKey` (`toPublicActivities`, ADR 0004).
 */

function lessonSummary(lesson: Lesson, state: GameState): LessonSummary {
  return {
    id: lesson.id,
    worldId: lesson.worldId,
    order: lesson.order,
    title: lesson.title,
    intro: lesson.intro,
    objectives: lesson.objectives,
    estimatedMinutes: lesson.estimatedMinutes,
    isFinalMission: lesson.isFinalMission,
    vocabularyCount: lesson.vocabularyIds.length,
    activityCount: lesson.activityIds.length,
    completed: state.completedLessonIds.includes(lesson.id),
  };
}

function worldSummary(world: World, state: GameState): WorldSummary {
  const lessons = getWorldLessons(world.id);
  const completed = state.completedLessonIds.filter((id) =>
    lessons.some((lesson) => lesson.id === id),
  ).length;

  return {
    id: world.id,
    title: world.title,
    description: world.description,
    goal: world.goal,
    order: world.order,
    level: world.level,
    theme: world.theme,
    prerequisites: world.prerequisites,
    badgeId: world.badgeId,
    unlocked: state.unlockedWorldIds.includes(world.id),
    completed: state.completedWorldIds.includes(world.id),
    lessonsCompleted: completed,
    lessonsTotal: lessons.length,
  };
}

async function loadState(ownerId: string, profileId: string): Promise<GameState> {
  const { db } = await profileContext(ownerId, profileId);
  return toGameState(await ensureGameState(db, profileId));
}

export async function listWorldSummaries(
  ownerId: string,
  profileId: string,
): Promise<WorldSummary[]> {
  const state = await loadState(ownerId, profileId);
  return PUBLISHED_WORLDS.map((world) => worldSummary(world, state));
}

export async function getWorldDetail(
  ownerId: string,
  profileId: string,
  worldId: string,
): Promise<WorldDetailView> {
  const world = getWorld(worldId);
  if (!world || !world.published) throw apiError.notFound("Ese mundo no existe.");

  const state = await loadState(ownerId, profileId);
  return {
    world: worldSummary(world, state),
    lessons: getWorldLessons(worldId).map((lesson) => lessonSummary(lesson, state)),
  };
}

export async function getLessonDetail(
  ownerId: string,
  profileId: string,
  lessonId: string,
): Promise<LessonDetailView> {
  const lesson = getLesson(lessonId);
  if (!lesson || !lesson.published) throw apiError.notFound("Esa leccion no existe.");

  const state = await loadState(ownerId, profileId);

  return {
    lesson: lessonSummary(lesson, state),
    activities: toPublicActivities(getLessonActivities(lessonId)),
    vocabulary: getLessonVocabulary(lessonId),
  };
}
