import { z } from "zod";

/**
 * Variables de entorno del servidor.
 *
 * Se validan una sola vez y de forma perezosa: la aplicacion puede arrancar y
 * servir las pantallas publicas aunque no haya base de datos configurada. Las
 * funciones `require*` lanzan un error controlado (`DB_UNAVAILABLE`) solo cuando
 * de verdad se necesita el recurso.
 */

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_BASE_URL: z.string().min(1).default("http://localhost:3000"),
  MONGODB_URI: z.string().min(1).optional(),
  MONGODB_DB: z.string().min(1).default("english_quest"),
  MONGODB_URI_TEST: z.string().min(1).optional(),
  MONGODB_DB_TEST: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(32).optional(),
  /**
   * Adelanta el reloj del servidor para repasar sin esperar dias reales.
   *
   * Es una palanca de desarrollo y pruebas, no una funcion del producto: solo
   * se aplica fuera de produccion (ver `docs/DEPLOYMENT.md`).
   */
  REVIEW_TIME_OFFSET_MS: z.coerce.number().int().min(0).optional(),
});

export type ServerEnv = z.infer<typeof envSchema>;

let cached: ServerEnv | null = null;

export function getEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "(raiz)"}: ${issue.message}`)
      .join("; ");
    console.warn(`[env] variables de entorno no validas (${detail}); se usan valores seguros.`);
    cached = envSchema.parse({});
    return cached;
  }

  cached = parsed.data;
  return cached;
}

/** Solo para pruebas: fuerza a releer `process.env` en la siguiente llamada. */
export function resetEnvCache(): void {
  cached = null;
}

export function isDbConfigured(): boolean {
  return typeof getEnv().MONGODB_URI === "string";
}

export function getDbUri(): string {
  const uri = getEnv().MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI no esta definida. Copia .env.example a .env.local o define la variable de entorno.",
    );
  }
  return uri;
}

export function getDbName(): string {
  return getEnv().MONGODB_DB;
}

export function isAuthConfigured(): boolean {
  const secret = getEnv().AUTH_SECRET;
  return typeof secret === "string" && secret.length >= 32;
}

export function getAuthSecret(): string {
  const secret = getEnv().AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET no esta definida o es demasiado corta (minimo 32 caracteres). Genera una con: node -e \"console.log(require('crypto').randomBytes(48).toString('base64url'))\"",
    );
  }
  return secret;
}

/** Conexion usada por las pruebas de integracion. */
export function getTestDbUri(): string {
  const env = getEnv();
  return env.MONGODB_URI_TEST ?? env.MONGODB_URI ?? "mongodb://localhost:27017";
}

export function getTestDbName(): string {
  return getEnv().MONGODB_DB_TEST ?? `${getEnv().MONGODB_DB}_test`;
}
