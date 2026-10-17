/**
 * Normalizacion de respuestas de texto.
 *
 * Se usa tanto en cliente (comparacion inmediata) como en servidor (autoridad).
 * Reglas: minusculas, sin acentos, apóstrofos unificados, sin puntuacion,
 * espacios colapsados.
 */
export function normalizeAnswer(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bc]/g, "'")
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Indica si `given` coincide con alguna de las respuestas aceptadas. */
export function matchesAny(given: string, accepted: readonly string[]): boolean {
  const normalized = normalizeAnswer(given);
  if (normalized.length === 0) return false;
  return accepted.some((candidate) => normalizeAnswer(candidate) === normalized);
}
