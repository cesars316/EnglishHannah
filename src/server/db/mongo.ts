import { MongoClient, type Db } from "mongodb";

import { getDbName, getDbUri, isDbConfigured } from "@/server/env";
import { apiError } from "@/server/http/errors";

/**
 * Cliente de MongoDB.
 *
 * El cliente se cachea en `globalThis` para sobrevivir al recargado en caliente
 * de Next.js en desarrollo (si no, cada recarga abriria un pool nuevo). En
 * produccion hay un unico pool por proceso.
 *
 * La conexion NO se abre al importar el modulo: solo al primer uso, de modo que
 * las pantallas sin base de datos siguen funcionando.
 */

type MongoGlobal = typeof globalThis & {
  __eqMongoClient?: MongoClient;
  __eqMongoConnecting?: Promise<MongoClient>;
};

const globalForMongo = globalThis as MongoGlobal;

function createClient(uri: string): MongoClient {
  return new MongoClient(uri, {
    serverSelectionTimeoutMS: 5_000,
    connectTimeoutMS: 5_000,
    // Sin replica set local no hay transacciones; el codigo no las usa.
    retryWrites: true,
  });
}

export async function getMongoClient(): Promise<MongoClient> {
  if (globalForMongo.__eqMongoClient) return globalForMongo.__eqMongoClient;

  if (!isDbConfigured()) {
    throw apiError.dbUnavailable(new Error("MONGODB_URI no esta definida."));
  }

  if (!globalForMongo.__eqMongoConnecting) {
    const client = createClient(getDbUri());
    globalForMongo.__eqMongoConnecting = client.connect().then(
      (connected) => {
        globalForMongo.__eqMongoClient = connected;
        globalForMongo.__eqMongoConnecting = undefined;
        return connected;
      },
      (error: unknown) => {
        globalForMongo.__eqMongoConnecting = undefined;
        void client.close().catch(() => undefined);
        throw error;
      },
    );
  }

  return globalForMongo.__eqMongoConnecting;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(getDbName());
}

/** Comprueba la conexion con un `ping`. Nunca lanza: devuelve `false` si falla. */
export async function pingDb(): Promise<boolean> {
  if (!isDbConfigured()) return false;
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}

export async function closeMongo(): Promise<void> {
  const client = globalForMongo.__eqMongoClient;
  globalForMongo.__eqMongoClient = undefined;
  globalForMongo.__eqMongoConnecting = undefined;
  if (client) await client.close();
}
