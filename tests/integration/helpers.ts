import { MongoClient } from "mongodb";

import { ensureIndexes } from "@/server/db/collections";
import { closeMongo, getDb } from "@/server/db/mongo";
import { getTestDbUri } from "@/server/env";

/** Utilidades compartidas por las suites de integracion. */

/** `true` si hay un MongoDB accesible. Nunca lanza. */
export async function mongoAvailable(): Promise<boolean> {
  const client = new MongoClient(getTestDbUri(), { serverSelectionTimeoutMS: 2_000 });
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    return true;
  } catch {
    return false;
  } finally {
    await client.close().catch(() => undefined);
  }
}

/** Vacia la base de pruebas y vuelve a crear los indices. */
export async function resetDatabase(): Promise<void> {
  const db = await getDb();
  await db.dropDatabase();
  await ensureIndexes(db);
}

/** Cierra el cliente compartido para que Vitest pueda terminar. */
export async function disconnect(): Promise<void> {
  await closeMongo();
}
