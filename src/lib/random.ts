/**
 * Aleatoriedad controlada.
 *
 * Se necesita ordenar opciones de forma aparentemente aleatoria pero
 * reproducible por intento (para que recargar la misma actividad no cambie el
 * orden ni duplique opciones).
 */

/** PRNG determinista (mulberry32). Devuelve valores en [0, 1). */
export function createSeededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let state = h >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Copia mezclada de `items` usando `random` (por defecto, aleatorio real). */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const a = result[i];
    const b = result[j];
    if (a === undefined || b === undefined) continue;
    result[i] = b;
    result[j] = a;
  }
  return result;
}

/** Mezcla determinista a partir de una semilla textual. */
export function shuffleWithSeed<T>(items: readonly T[], seed: string): T[] {
  return shuffle(items, createSeededRandom(seed));
}
