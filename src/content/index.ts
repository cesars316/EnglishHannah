import { ANIMAL_PARK_ACTIVITIES } from "@/content/activities/animal-park";
import { CLOTHES_STREET_ACTIVITIES } from "@/content/activities/clothes-street";
import { COLOR_FOREST_ACTIVITIES } from "@/content/activities/color-forest";
import { FAMILY_HOME_ACTIVITIES } from "@/content/activities/family-home";
import { FOOD_MARKET_ACTIVITIES } from "@/content/activities/food-market";
import { HELLO_VILLAGE_ACTIVITIES } from "@/content/activities/hello-village";
import { MY_HOUSE_ACTIVITIES } from "@/content/activities/my-house";
import { NUMBER_BEACH_ACTIVITIES } from "@/content/activities/number-beach";
import { ANIMAL_PARK_LESSONS } from "@/content/lessons/animal-park";
import { CLOTHES_STREET_LESSONS } from "@/content/lessons/clothes-street";
import { COLOR_FOREST_LESSONS } from "@/content/lessons/color-forest";
import { FAMILY_HOME_LESSONS } from "@/content/lessons/family-home";
import { FOOD_MARKET_LESSONS } from "@/content/lessons/food-market";
import { HELLO_VILLAGE_LESSONS } from "@/content/lessons/hello-village";
import { MY_HOUSE_LESSONS } from "@/content/lessons/my-house";
import { NUMBER_BEACH_LESSONS } from "@/content/lessons/number-beach";
import { ANIMAL_PARK_VOCABULARY } from "@/content/vocabulary/animal-park";
import { CLOTHES_STREET_VOCABULARY } from "@/content/vocabulary/clothes-street";
import { COLOR_FOREST_VOCABULARY } from "@/content/vocabulary/color-forest";
import { FAMILY_HOME_VOCABULARY } from "@/content/vocabulary/family-home";
import { FOOD_MARKET_VOCABULARY } from "@/content/vocabulary/food-market";
import { HELLO_VILLAGE_VOCABULARY } from "@/content/vocabulary/hello-village";
import { MY_HOUSE_VOCABULARY } from "@/content/vocabulary/my-house";
import { NUMBER_BEACH_VOCABULARY } from "@/content/vocabulary/number-beach";
import { BADGES } from "@/content/badges";
import { PUBLISHED_WORLDS, WORLDS, WORLDS_BY_ID } from "@/content/worlds";
import type { Activity, Badge, Lesson, VocabularyItem, World } from "@/types/content";

/** Fuente unica de verdad del contenido pedagogico (ver ADR 0002). */

export const ALL_WORLDS: readonly World[] = WORLDS;
export { PUBLISHED_WORLDS, WORLDS_BY_ID };
export { BADGES };

export const ALL_VOCABULARY: readonly VocabularyItem[] = [
  ...HELLO_VILLAGE_VOCABULARY,
  ...COLOR_FOREST_VOCABULARY,
  ...NUMBER_BEACH_VOCABULARY,
  ...ANIMAL_PARK_VOCABULARY,
  ...FAMILY_HOME_VOCABULARY,
  ...FOOD_MARKET_VOCABULARY,
  ...MY_HOUSE_VOCABULARY,
  ...CLOTHES_STREET_VOCABULARY,
];

export const ALL_LESSONS: readonly Lesson[] = [
  ...HELLO_VILLAGE_LESSONS,
  ...COLOR_FOREST_LESSONS,
  ...NUMBER_BEACH_LESSONS,
  ...ANIMAL_PARK_LESSONS,
  ...FAMILY_HOME_LESSONS,
  ...FOOD_MARKET_LESSONS,
  ...MY_HOUSE_LESSONS,
  ...CLOTHES_STREET_LESSONS,
];

export const ALL_ACTIVITIES: readonly Activity[] = [
  ...HELLO_VILLAGE_ACTIVITIES,
  ...COLOR_FOREST_ACTIVITIES,
  ...NUMBER_BEACH_ACTIVITIES,
  ...ANIMAL_PARK_ACTIVITIES,
  ...FAMILY_HOME_ACTIVITIES,
  ...FOOD_MARKET_ACTIVITIES,
  ...MY_HOUSE_ACTIVITIES,
  ...CLOTHES_STREET_ACTIVITIES,
];

function indexById<T extends { id: string }>(items: readonly T[]): Readonly<Record<string, T>> {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

export const VOCABULARY_BY_ID: Readonly<Record<string, VocabularyItem>> = indexById(ALL_VOCABULARY);
export const LESSONS_BY_ID: Readonly<Record<string, Lesson>> = indexById(ALL_LESSONS);
export const ACTIVITIES_BY_ID: Readonly<Record<string, Activity>> = indexById(ALL_ACTIVITIES);
export const BADGES_BY_ID: Readonly<Record<string, Badge>> = indexById(BADGES);

export function getWorld(worldId: string): World | null {
  return WORLDS_BY_ID[worldId] ?? null;
}

export function getLesson(lessonId: string): Lesson | null {
  return LESSONS_BY_ID[lessonId] ?? null;
}

export function getActivity(activityId: string): Activity | null {
  return ACTIVITIES_BY_ID[activityId] ?? null;
}

export function getVocabularyItem(vocabularyId: string): VocabularyItem | null {
  return VOCABULARY_BY_ID[vocabularyId] ?? null;
}

export function getBadge(badgeId: string): Badge | null {
  return BADGES_BY_ID[badgeId] ?? null;
}

export function getWorldLessons(worldId: string): Lesson[] {
  return ALL_LESSONS.filter((lesson) => lesson.worldId === worldId).sort(
    (a, b) => a.order - b.order,
  );
}

export function getWorldVocabulary(worldId: string): VocabularyItem[] {
  return ALL_VOCABULARY.filter((item) => item.worldId === worldId);
}

/** Actividades de una leccion, en el orden en que deben presentarse. */
export function getLessonActivities(lessonId: string): Activity[] {
  return ALL_ACTIVITIES.filter((activity) => activity.lessonId === lessonId).sort(
    (a, b) => a.order - b.order,
  );
}

export function getLessonVocabulary(lessonId: string): VocabularyItem[] {
  const lesson = getLesson(lessonId);
  if (!lesson) return [];
  return lesson.vocabularyIds
    .map((id) => VOCABULARY_BY_ID[id])
    .filter((item): item is VocabularyItem => item !== undefined);
}

/** La primera leccion de un mundo (punto de entrada). */
export function getFirstLessonId(worldId: string): string | null {
  const lessons = getWorldLessons(worldId);
  return lessons[0]?.id ?? null;
}

export function getWorldOrder(): World[] {
  return [...PUBLISHED_WORLDS].sort((a, b) => a.order - b.order);
}
