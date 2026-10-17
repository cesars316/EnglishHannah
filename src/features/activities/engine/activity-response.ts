import { z } from "zod";

import type { ActivityResponse } from "@/types/content";

/**
 * Esquema de una respuesta de actividad.
 *
 * Compartido: el servidor lo valida en la API (autoridad) y el cliente lo usa
 * para dar fallo inmediato antes de hacer la peticion. Validar en los dos
 * sitios evita gastar una peticion en algo que esta mal formado.
 */

export const optionIdSchema = z.string().min(1).max(120);

export const activityResponseSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("choice"), optionId: optionIdSchema }),
  z.object({
    kind: z.literal("pairs"),
    pairs: z
      .array(z.object({ leftId: optionIdSchema, rightId: optionIdSchema }))
      .min(1)
      .max(12),
  }),
  z.object({ kind: z.literal("text"), text: z.string().max(200) }),
  z.object({ kind: z.literal("speech"), transcript: z.string().max(300).nullable() }),
  z.object({ kind: z.literal("self-report"), practiced: z.boolean() }),
]);

/** Devuelve la respuesta validada o `null` si no es valida. */
export function parseActivityResponse(value: unknown): ActivityResponse | null {
  const parsed = activityResponseSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
