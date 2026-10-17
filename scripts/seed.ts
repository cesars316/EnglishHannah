/**
 * Prepara la base de datos: crea los indices necesarios.
 *
 * Es idempotente: ejecutarlo dos veces no cambia nada. No inserta contenido (el
 * contenido es codigo versionado, ADR 0002) ni datos de ejemplo.
 *
 * Uso: `npm run seed` (necesita MONGODB_URI en .env.local).
 */
import { ensureIndexes } from "../src/server/db/collections";
import { closeMongo, getDb } from "../src/server/db/mongo";
import { loadEnvFiles } from "../src/server/env-file";
import { getDbName, isDbConfigured } from "../src/server/env";

loadEnvFiles();

async function main(): Promise<void> {
  if (!isDbConfigured()) {
    console.error(
      "MONGODB_URI no esta definida. Copia .env.example a .env.local o exporta la variable.",
    );
    process.exitCode = 1;
    return;
  }

  const db = await getDb();
  const indexes = await ensureIndexes(db);

  console.log(`Base de datos: ${getDbName()}`);
  console.log("Indices asegurados:");
  for (const name of indexes) console.log(` - ${name}`);
  console.log("Listo.");
}

main()
  .catch((error: unknown) => {
    console.error("No se pudo preparar la base de datos:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeMongo();
  });
