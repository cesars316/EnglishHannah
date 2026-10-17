import { existsSync } from "node:fs";

/**
 * Carga archivos `.env*` en `process.env` para codigo que corre FUERA de Next.js
 * (scripts y pruebas de integracion).
 *
 * Next.js ya carga `.env.local` por su cuenta en la aplicacion; los scripts
 * (`npm run seed`) y Vitest no, asi que lo hacen aqui. Nunca se sobreescriben
 * variables ya definidas en el entorno.
 */
export function loadEnvFiles(files: readonly string[] = [".env.local", ".env"]): void {
  if (typeof process.loadEnvFile !== "function") return;

  for (const file of files) {
    if (!existsSync(file)) continue;
    try {
      process.loadEnvFile(file);
    } catch {
      /* archivo ilegible o con formato invalido: se usan las variables actuales */
    }
  }
}
