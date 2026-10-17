import { CONTENT_VERSION } from "@/config/game";
import { isDbConfigured } from "@/server/env";
import { pingDb } from "@/server/db/mongo";
import { apiRoute } from "@/server/http/route";
import { ok } from "@/server/http/respond";

/**
 * Estado de la aplicacion y de la base de datos.
 *
 * No requiere sesion y NO revela secretos ni cadenas de conexion: solo si hay
 * base de datos configurada y si responde.
 */

export const dynamic = "force-dynamic";

export const GET = apiRoute(async ({ requestId }) => {
  const configured = isDbConfigured();
  const database = configured ? ((await pingDb()) ? "up" : "down") : "unconfigured";

  return ok(
    {
      status: database === "up" ? "ok" : "degraded",
      database,
      contentVersion: CONTENT_VERSION,
      time: new Date().toISOString(),
    },
    requestId,
  );
});
