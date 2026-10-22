import { getEnv } from "@/server/env";

/**
 * Reloj del servidor.
 *
 * `REVIEW_TIME_OFFSET_MS` adelanta el reloj para poder comprobar el repaso sin
 * esperar los intervalos reales (hoy, un fallo no vuelve a proponerse hasta el
 * dia siguiente). Solo se aplica fuera de produccion: en produccion siempre es
 * `new Date()`.
 *
 * Ver `docs/ARCHITECTURE.md` y `docs/DEPLOYMENT.md`.
 */
export function serverNow(): Date {
  const env = getEnv();
  const offset = env.NODE_ENV === "production" ? undefined : env.REVIEW_TIME_OFFSET_MS;
  if (!offset) return new Date();
  return new Date(Date.now() + offset);
}
