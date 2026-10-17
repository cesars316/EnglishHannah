import { makeProgressId } from "@/features/progress/logic";
import type {
  AttemptDoc,
  GameStateDoc,
  ProfileDoc,
  ProgressDoc,
} from "@/server/db/collections";
import type {
  ActivityAttempt,
  GameState,
  Profile,
  ProgressRecord,
} from "@/types/domain";

/**
 * Convierte documentos de MongoDB a los tipos de dominio compartidos.
 *
 * Las fechas se guardan como `Date` en la base de datos y viajan como texto ISO
 * en la API (igual que en el cliente), asi que la conversion vive en un unico
 * sitio.
 */

function toIso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

export function toProfile(doc: ProfileDoc): Profile {
  return {
    id: doc._id,
    displayName: doc.displayName,
    avatarId: doc.avatarId,
    locale: doc.locale,
    targetLanguage: doc.targetLanguage,
    settings: { ...doc.settings },
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toProgressRecord(doc: ProgressDoc): ProgressRecord {
  return {
    // El `id` de dominio NO incluye el perfil: `toProgressDoc` lo vuelve a
    // prefijar para construir la clave de almacenamiento `${profileId}:${id}`.
    id: makeProgressId(doc.entityType, doc.entityId),
    profileId: doc.profileId,
    entityType: doc.entityType,
    entityId: doc.entityId,
    status: doc.status,
    seenCount: doc.seenCount,
    correctCount: doc.correctCount,
    incorrectCount: doc.incorrectCount,
    activityTypesCompleted: [...doc.activityTypesCompleted],
    distinctPracticeDays: doc.distinctPracticeDays,
    lastPracticedAt: toIso(doc.lastPracticedAt),
    nextReviewAt: toIso(doc.nextReviewAt),
    masteryScore: doc.masteryScore,
    source: doc.source,
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toAttempt(doc: AttemptDoc): ActivityAttempt {
  return {
    id: doc._id,
    profileId: doc.profileId,
    activityId: doc.activityId,
    lessonId: doc.lessonId,
    worldId: doc.worldId,
    skill: doc.skill,
    result: doc.result,
    attemptNumber: doc.attemptNumber,
    durationMs: doc.durationMs,
    hintUsed: doc.hintUsed,
    xpAwarded: doc.xpAwarded,
    createdAt: doc.createdAt.toISOString(),
  };
}

export function toGameState(doc: GameStateDoc): GameState {
  return {
    profileId: doc._id,
    xp: doc.xp,
    coins: doc.coins,
    currentWorldId: doc.currentWorldId,
    unlockedWorldIds: [...doc.unlockedWorldIds],
    completedLessonIds: [...doc.completedLessonIds],
    completedWorldIds: [...doc.completedWorldIds],
    earnedBadgeIds: [...doc.earnedBadgeIds],
    activityCount: doc.activityCount,
    lastActivityAt: toIso(doc.lastActivityAt),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/** Inverso de `toGameState`: prepara el documento para `replaceOne`. */
export function toGameStateDoc(state: GameState, now: Date = new Date()): GameStateDoc {
  return {
    _id: state.profileId,
    xp: state.xp,
    coins: state.coins,
    currentWorldId: state.currentWorldId,
    unlockedWorldIds: [...state.unlockedWorldIds],
    completedLessonIds: [...state.completedLessonIds],
    completedWorldIds: [...state.completedWorldIds],
    earnedBadgeIds: [...state.earnedBadgeIds],
    activityCount: state.activityCount,
    lastActivityAt: state.lastActivityAt ? new Date(state.lastActivityAt) : null,
    updatedAt: now,
  };
}

/** Inverso de `toProgressRecord`. */
export function toProgressDoc(record: ProgressRecord, now: Date = new Date()): ProgressDoc {
  return {
    _id: `${record.profileId}:${record.id}`,
    profileId: record.profileId,
    entityType: record.entityType,
    entityId: record.entityId,
    status: record.status,
    seenCount: record.seenCount,
    correctCount: record.correctCount,
    incorrectCount: record.incorrectCount,
    activityTypesCompleted: [...record.activityTypesCompleted],
    distinctPracticeDays: record.distinctPracticeDays,
    lastPracticedAt: record.lastPracticedAt ? new Date(record.lastPracticedAt) : null,
    nextReviewAt: record.nextReviewAt ? new Date(record.nextReviewAt) : null,
    masteryScore: record.masteryScore,
    source: record.source,
    updatedAt: now,
  };
}
