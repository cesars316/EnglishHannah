/**
 * Acceso seguro a `localStorage`.
 *
 * Reglas:
 * - Nunca se ejecuta durante el renderizado en servidor (guarda `window`).
 * - Un JSON corrupto no rompe la aplicacion: se descarta y se registra en
 *   consola de forma no intrusiva.
 */

const isBrowser = (): boolean => typeof window !== "undefined" && !!window.localStorage;

export function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* almacenamiento no disponible */
  }
}

/** Devuelve todas las claves que empiezan por `prefix`. */
export function keysWithPrefix(prefix: string): string[] {
  if (!isBrowser()) return [];
  const result: string[] = [];
  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key && key.startsWith(prefix)) result.push(key);
    }
  } catch {
    /* almacenamiento no disponible */
  }
  return result;
}

/** Identificador unico. Usa `crypto.randomUUID` cuando existe. */
export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
