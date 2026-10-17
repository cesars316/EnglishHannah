# ADR 0004 - Integridad del juego: validacion en servidor e idempotencia

- **Estado:** aceptado
- **Fecha:** 2026-10-16

## Contexto

El documento maestro exige: no enviar respuestas correctas al cliente en actividades
de evaluacion; validar en servidor los resultados que afectan a recompensas; y no
duplicar XP/recompensas cuando una peticion HTTP se repite (reintentos de red).

## Decision

1. **Proyeccion publica de actividad.** `toPublicActivity()` elimina `answerKey`,
   `answer` y cualquier campo que revele la solucion. Los endpoints de leccion
   devuelven siempre la proyeccion publica.

2. **Validacion unica y compartida.** La funcion `evaluateActivity(activity, response)`
   vive en `src/features/activities/engine/` y es pura. El servidor la usa como
   autoridad; el cliente la usa solo para el modo offline.
   El servidor **nunca** confia en un `isCorrect` enviado por el cliente.

3. **Idempotencia de intentos.** Cada intento lleva un `clientAttemptId` (UUID generado
   en el cliente) y existe un indice unico `{ profileId, clientAttemptId }` en
   `activityAttempts`. Repetir la misma peticion devuelve el mismo resultado y **no**
   vuelve a otorgar XP.

4. **Idempotencia de recompensas.** XP de leccion, insignias y desbloqueos se aplican
   con operaciones idempotentes sobre conjuntos (`$addToSet`) en `gameState`.
   Completar una leccion ya completada no otorga XP de nuevo.

5. **Centralizacion de valores.** Todos los valores de XP, monedas y umbrales viven en
   `src/config/rewards.ts` (configuracion unica). Los componentes no contienen numeros
   magicos.

6. **Sin bloqueo por error.** Un fallo de red produce estado explicito ("no guardado")
   con boton de reintento; nunca se simula exito.

## Consecuencias

- El modo offline evalua en cliente y marca el progreso como "pendiente de sincronizar".
- El servidor es siempre la fuente de verdad del progreso persistido.
