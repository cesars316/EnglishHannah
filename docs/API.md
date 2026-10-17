# API v1 - Contratos

Base: `/api/v1`. Formato: JSON. Todas las respuestas envuelven los datos.

Los tipos exactos viven en `src/types/api.ts`, que es la unica fuente de verdad
para los tipos "de cable"; el servidor y el cliente importan de ahi.

## Sobre de respuesta

Exito:

```json
{ "data": {}, "meta": { "requestId": "uuid" } }
```

Error:

```json
{
  "error": { "code": "VALIDATION_ERROR", "message": "Revisa la informacion.", "details": [] },
  "meta": { "requestId": "uuid" }
}
```

Codigos de error: `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401),
`PARENT_AUTH_REQUIRED` (403), `NOT_FOUND` (404), `CONFLICT` (409),
`RATE_LIMITED` (429), `PAYLOAD_TOO_LARGE` (413), `DB_UNAVAILABLE` (503),
`INTERNAL_ERROR` (500).

Nunca se devuelven stack traces, consultas ni credenciales.

## Identidad

- Cookie `eq_session` (httpOnly, firmada con HMAC-SHA256, 180 dias): identifica
  al dispositivo/adulto y guarda el `ownerId`. El servidor **nunca** acepta un
  `ownerId` enviado por el navegador: lo deduce de la cookie firmada.
- Cookie `eq_parent` (httpOnly, 30 min): autoriza las acciones sensibles
  (borrado, ajustes, exportacion). Se emite al crear o verificar el codigo
  parental con `POST /parent/setup` o `POST /parent/unlock`.

Los endpoints marcados como "sesion (se crea si falta)" emiten la cookie
automaticamente en la primera llamada; los marcados como "sesion" exigen una
cookie valida y responden `UNAUTHORIZED` (401) si no la hay.

## Endpoints

| Metodo | Ruta                                    | Auth                       | Descripcion                                                              |
| ------ | --------------------------------------- | -------------------------- | ------------------------------------------------------------------------ |
| GET    | `/health`                               | -                          | Estado de la app y de la DB, sin secretos.                               |
| GET    | `/profiles`                             | sesion (se crea si falta)  | Lista los perfiles infantiles del dispositivo.                           |
| POST   | `/profiles`                             | sesion (se crea si falta)  | Crea un perfil (`displayName`, `avatarId?`). Responde 201.              |
| GET    | `/profiles/:profileId`                  | sesion + propiedad         | Perfil del jugador.                                                      |
| PATCH  | `/profiles/:profileId`                  | sesion + propiedad         | Cambia `displayName` y/o `avatarId`.                                     |
| DELETE | `/profiles/:profileId`                  | parental                   | Elimina el perfil y sus datos en cascada.                                |
| PATCH  | `/profiles/:profileId/settings`         | parental                   | Cambia los ajustes (`{ settings }`) del perfil.                          |
| GET    | `/profiles/:profileId/progress`         | sesion + propiedad         | Progreso agregado (`{ summary }`).                                       |
| DELETE | `/profiles/:profileId/progress`         | parental                   | Reinicia el progreso y conserva el perfil.                               |
| GET    | `/profiles/:profileId/review`           | sesion + propiedad         | Plan de repaso (`ReviewPlan`: palabras y actividades listas).            |
| GET    | `/profiles/:profileId/rewards`          | sesion + propiedad         | XP, monedas e insignias (`{ gameState, badges }`).                       |
| GET    | `/profiles/:profileId/export`           | parental                   | Exporta todos los datos del perfil en JSON (`ExportBundle`).             |
| GET    | `/worlds?profileId=`                    | sesion + propiedad         | Mundos con estado de desbloqueo (`{ worlds }`).                          |
| GET    | `/worlds/:worldId?profileId=`           | sesion + propiedad         | Detalle del mundo (`{ world, lessons }`).                                |
| GET    | `/lessons/:lessonId?profileId=`         | sesion + propiedad         | Leccion con actividades **publicas** (sin `answerKey`) y vocabulario.    |
| POST   | `/activities/:activityId/answer`        | sesion (se crea si falta)  | Valida respuesta, registra intento, otorga XP. Idempotente.              |
| POST   | `/lessons/:lessonId/complete`           | sesion (se crea si falta)  | Marca la leccion completada y otorga el bonus. Idempotente.              |
| POST   | `/parent/setup`                         | sesion (se crea si falta)  | Crea el codigo parental (solo la primera vez) y desbloquea. Responde 201.|
| GET    | `/parent/status`                        | sesion (se crea si falta)  | `{ hasPasscode, unlocked }`.                                             |
| POST   | `/parent/unlock`                        | sesion (se crea si falta)  | Verifica el codigo y emite `eq_parent`.                                  |
| POST   | `/parent/lock`                          | -                          | Cierra la zona parental (borra `eq_parent`).                             |
| POST   | `/parent/passcode`                      | parental                   | Cambia el codigo parental (exige el actual).                             |
| GET    | `/parent/overview`                      | parental                   | Resumen de todos los perfiles (`{ profiles }`).                          |

Las rutas `/worlds`, `/worlds/:worldId` y `/lessons/:lessonId` exigen el query
param `profileId`: sin el no se puede calcular el progreso (400).

## Ejemplos

### POST /activities/:activityId/answer

Request:

```json
{
  "profileId": "uuid",
  "clientAttemptId": "uuid",
  "response": { "kind": "choice", "optionId": "blue" },
  "attemptNumber": 1,
  "durationMs": 4200,
  "hintUsed": false,
  "isReview": false
}
```

Response (`AnswerActivityResult`):

```json
{
  "data": {
    "duplicate": false,
    "evaluation": { "isCorrect": true, "correctOptionIds": ["blue"] },
    "feedback": { "es": "¡Perfecto!", "en": "Well done!" },
    "xpAwarded": 15,
    "coinsAwarded": 1,
    "attemptNumber": 1,
    "solved": true,
    "revealed": false,
    "totalAttempts": 1,
    "gameState": { "profileId": "uuid", "xp": 15, "coins": 1, "...": "..." },
    "earnedBadgeIds": []
  },
  "meta": { "requestId": "uuid" }
}
```

- `clientAttemptId` es un UUID generado por el navegador. Si ya existia,
  `duplicate: true` y se devuelven las mismas recompensas **sin** volver a
  escribir en la base de datos.
- `attemptNumber` es el intento dentro de la sesion (1 = primero), validado
  entre 1 y 20; da derecho al bonus de primer intento.
- Cada envio (incluidos los fallos) registra un intento.
- XP y monedas solo se aplican cuando `solved` o `revealed`.

### POST /lessons/:lessonId/complete

Request:

```json
{ "profileId": "uuid", "clientAttemptId": "uuid" }
```

Response (`CompleteLessonResult`): bonus de XP/monedas (una sola vez), mundos
recien desbloqueados, `gameState` actualizado e insignias. Idempotente por
`clientAttemptId`.

### PATCH /profiles/:profileId/settings

Requiere la zona parental desbloqueada. El cuerpo lleva la configuracion
completa (`{ settings }`), no un parche parcial:

```json
{
  "settings": {
    "microphoneEnabled": false,
    "cameraEnabled": false,
    "soundEnabled": true,
    "reducedMotion": false
  }
}
```

## Rate limiting

- `POST /parent/unlock`: 5 intentos / 5 minutos por sesion.
- `POST /profiles`: 10 / hora por sesion.
- Resto: limite amplio configurable.

## Cabeceras y seguridad

- `Content-Type: application/json`.
- `Cache-Control: no-store` en todo lo que dependa del perfil.
- Limite de body: 64 KB (`PAYLOAD_TOO_LARGE` si se supera).
- Validacion Zod de params y body.
- Verificacion de pertenencia del perfil en cada operacion (404 si el perfil no
  es del `ownerId` de la sesion).
