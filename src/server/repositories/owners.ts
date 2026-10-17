import type { Db } from "mongodb";

import { ownersCollection, type OwnerDoc } from "@/server/db/collections";

/**
 * Repositorio de propietarios (el dispositivo/adulto).
 *
 * El `ownerId` lo genera el servidor y viaja en la cookie firmada; aqui solo se
 * crea de forma perezosa para poder guardar el codigo parental.
 */

export async function ensureOwner(db: Db, ownerId: string, now: Date = new Date()): Promise<void> {
  await ownersCollection(db).updateOne(
    { _id: ownerId },
    {
      $setOnInsert: {
        parentPasscodeHash: null,
        parentPasscodeSalt: null,
        createdAt: now,
      },
      $set: { updatedAt: now },
    },
    { upsert: true },
  );
}

export async function getOwner(db: Db, ownerId: string): Promise<OwnerDoc | null> {
  return ownersCollection(db).findOne({ _id: ownerId });
}

export async function setParentPasscode(
  db: Db,
  ownerId: string,
  credentials: { hash: string; salt: string },
  now: Date = new Date(),
): Promise<void> {
  await ownersCollection(db).updateOne(
    { _id: ownerId },
    {
      $set: {
        parentPasscodeHash: credentials.hash,
        parentPasscodeSalt: credentials.salt,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );
}

export async function clearParentPasscode(
  db: Db,
  ownerId: string,
  now: Date = new Date(),
): Promise<void> {
  await ownersCollection(db).updateOne(
    { _id: ownerId },
    { $set: { parentPasscodeHash: null, parentPasscodeSalt: null, updatedAt: now } },
  );
}
