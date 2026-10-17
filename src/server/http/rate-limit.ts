/**
 * Limitador de peticiones en memoria (ventana fija).
 *
 * Suficiente para un MVP familiar con un unico proceso Node: protege el codigo
 * parental de ataques por fuerza bruta y evita martillear la API. Si en el
 * futuro hay varias instancias, se sustituye por un almacen compartido sin
 * cambiar la firma.
 */

type Bucket = { count: number; resetAt: number };

const MAX_BUCKETS = 5_000;
const buckets = new Map<string, Bucket>();

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    pruneIfNeeded(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function resetRateLimits(): void {
  buckets.clear();
}

function pruneIfNeeded(now: number): void {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}
