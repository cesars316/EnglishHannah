import type { Collection, Db } from "mongodb";

import type { Skill } from "@/types/content";
import type {
  ActivityAttemptResult,
  MasteryStatus,
  ProfileSettings,
  ProgressEntityType,
} from "@/types/domain";

/**
 * Colecciones de MongoDB y sus indices.
 *
 * Los documentos usan `_id` con el identificador de dominio (UUID) para que las
 * operaciones sean idempotentes por naturaleza (`$addToSet`, `upsert` por clave
 * unica). Ver `docs/ARCHITECTURE.md` y `docs/API.md`.
 */

export const COLLECTIONS = {
  owners: "owners",
  profiles: "profiles",
  progress: "progress",
  attempts: "activityAttempts",
  gameState: "gameState",
} as const;

export type OwnerDoc = {
  _id: string;
  /** `scrypt(code, salt)` en hexadecimal. `null` hasta que el adulto crea el codigo. */
  parentPasscodeHash: string | null;
  parentPasscodeSalt: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProfileDoc = {
  _id: string;
  ownerId: string;
  displayName: string;
  avatarId: string;
  locale: string;
  targetLanguage: string;
  settings: ProfileSettings;
  createdAt: Date;
  updatedAt: Date;
};

export type ProgressDoc = {
  /** `${profileId}:${entityType}:${entityId}` (idempotencia por clave unica). */
  _id: string;
  profileId: string;
  entityType: ProgressEntityType;
  entityId: string;
  status: MasteryStatus;
  seenCount: number;
  correctCount: number;
  incorrectCount: number;
  activityTypesCompleted: string[];
  distinctPracticeDays: number;
  lastPracticedAt: Date | null;
  nextReviewAt: Date | null;
  masteryScore: number;
  source: "session" | "review" | "story";
  updatedAt: Date;
};

export type AttemptDoc = {
  _id: string;
  profileId: string;
  /** UUID generado en el cliente: garantiza que un reintento no duplique XP. */
  clientAttemptId: string;
  activityId: string;
  lessonId: string;
  worldId: string;
  skill: Skill;
  result: ActivityAttemptResult;
  attemptNumber: number;
  durationMs: number;
  hintUsed: boolean;
  xpAwarded: number;
  coinsAwarded: number;
  createdAt: Date;
};

export type GameStateDoc = {
  /** `profileId`. */
  _id: string;
  xp: number;
  coins: number;
  currentWorldId: string | null;
  unlockedWorldIds: string[];
  completedLessonIds: string[];
  completedWorldIds: string[];
  earnedBadgeIds: string[];
  activityCount: number;
  lastActivityAt: Date | null;
  updatedAt: Date;
};

export function ownersCollection(db: Db): Collection<OwnerDoc> {
  return db.collection<OwnerDoc>(COLLECTIONS.owners);
}

export function profilesCollection(db: Db): Collection<ProfileDoc> {
  return db.collection<ProfileDoc>(COLLECTIONS.profiles);
}

export function progressCollection(db: Db): Collection<ProgressDoc> {
  return db.collection<ProgressDoc>(COLLECTIONS.progress);
}

export function attemptsCollection(db: Db): Collection<AttemptDoc> {
  return db.collection<AttemptDoc>(COLLECTIONS.attempts);
}

export function gameStateCollection(db: Db): Collection<GameStateDoc> {
  return db.collection<GameStateDoc>(COLLECTIONS.gameState);
}

/**
 * Crea los indices (idempotente). Repetir la llamada no cambia nada.
 * Devuelve los nombres de indice para poder informarlos desde `seed`.
 */
export async function ensureIndexes(db: Db): Promise<string[]> {
  const created: string[] = [];

  await ownersCollection(db).createIndex({ updatedAt: 1 }, { name: "owners_updatedAt" });
  created.push("owners.updatedAt");

  await profilesCollection(db).createIndex({ ownerId: 1 }, { name: "profiles_ownerId" });
  created.push("profiles.ownerId");

  const progress = progressCollection(db);
  await progress.createIndex(
    { profileId: 1, entityType: 1, entityId: 1 },
    { name: "progress_entity_unique", unique: true },
  );
  created.push("progress.entity(unique)");
  await progress.createIndex({ profileId: 1, nextReviewAt: 1 }, { name: "progress_review" });
  created.push("progress.nextReviewAt");

  const attempts = attemptsCollection(db);
  await attempts.createIndex(
    { profileId: 1, clientAttemptId: 1 },
    { name: "attempts_client_unique", unique: true },
  );
  created.push("activityAttempts.clientAttemptId(unique)");
  await attempts.createIndex({ profileId: 1, createdAt: -1 }, { name: "attempts_recent" });
  created.push("activityAttempts.createdAt");

  return created;
}
