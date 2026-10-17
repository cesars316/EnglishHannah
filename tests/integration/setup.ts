/**
 * Preparacion de las pruebas de integracion.
 *
 * Redirige la aplicacion a una base de datos de pruebas DEDICADA
 * (`english_quest_test`) para no tocar nunca los datos reales, y fija una
 * `AUTH_SECRET` de pruebas. Se carga antes que los archivos de prueba.
 */
import { resetEnvCache } from "@/server/env";
import { loadEnvFiles } from "@/server/env-file";

loadEnvFiles();

(process.env as Record<string, string>).NODE_ENV = "test";
process.env.MONGODB_URI =
  process.env.MONGODB_URI_TEST ?? process.env.MONGODB_URI ?? "mongodb://localhost:27017";
process.env.MONGODB_DB = process.env.MONGODB_DB_TEST ?? "english_quest_test";
if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
  process.env.AUTH_SECRET = "integration-test-auth-secret-0123456789abcdef";
}

resetEnvCache();
