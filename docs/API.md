# API v1 - Contratos

Base: `/api/v1`. Formato: JSON. Todas las respuestas envuelven los datos.

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
`PARENT_AUTH_REQUIRED` (403), `NOT_FOUND` (404), `RATE_LIMITED` (429),
`CONFLICT` (409), `DB_UNAVAILABLE` (503), `INTERNAL_ERROR` (500).

Nunca se devuelven stack traces, consultas ni credenciales.

## Identidad

- Cookie `eq_session` (httpOnly, firmada): identifica al dispositivo/adulto.
  Se emite automaticamente en el primer endpoint que la necesite.
- Cookie `eq_parent` (httpOnly, 30 min): autoriza acciones sensibles.

## Endpoints

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/health` | - | Estado de la app y de la DB, sin secretos. |
| POST | `/profiles` | sesion | Crea perfil infantil (`displayName`, `avatarId`). |
| GET | `/profiles/:profileId` | sesion + propiedad | Perfil del jugador. |
| PATCH | `/profiles/:profileId/settings` | sesion + propiedad | Ajustes permitidos. |
| DELETE | `/profiles/:profileId` | parental | Elimina perfil y datos asociados (cascada). |
| GET | `/profiles/:profileId/progress` | sesion + propiedad | Progreso agregado. |
| GET | `/profiles/:profileId/review` | sesion + propiedad | Palabras/actividades para repasar. |
| GET | `/profiles/:profileId/rewards` | sesion + propiedad | XP, monedas, insignias. |
| GET | `/profiles/:profileId/export` | parental | Exporta todos los datos en JSON. |
| GET | `/worlds` | sesion | Mundos con estado de desbloqueo. |
| GET | `/worlds/:worldId` | sesion | Detalle del mundo (lecciones, progreso). |
| GET | `/lessons/:lessonId` | sesion | Leccion con actividades **publicas** (sin `answerKey`). |
| POST | `/activities/:activityId/answer` | sesion | Valida respuesta, registra intento, otorga XP. Idempotente. |
| POST | `/lessons/:lessonId/complete` | sesion | Marca leccion completada y otorga bonus. Idempotente. |
| POST | `/parent/setup` | sesion | Crea el codigo parental (solo la primera vez). |
| POST | `/parent/unlock` | sesion | Verifica el codigo parental y emite `eq_parent`. |
| POST | `/parent/lock` | - | Cierra la sesion parental. |
| GET | `/parent/overview` | parental | Resumen para el panel parental. |

## Ejemplos

### POST /activities/:activityId/answer

Request:

```json
{
  "profileId": "65f...",
  "clientAttemptId": "6f1c...",
  "response": { "optionId": "blue" },
  "hintUsed": false
}
```

Response:

```json
{
  "data": {
    "isCorrect": true,
    "xpAwarded": 12,
    "feedback": { "es": "Great job!", "en": "Great job!" },
    "nextReviewAt": "2026-10-19T00:00:00.000Z",
    "duplicate": false
  },
  "meta": { "requestId": "..." }
}
```

`duplicate: true` indica que el `clientAttemptId` ya existia; no se otorga XP de nuevo.

### POST /lessons/:lessonId/complete

```json
{ "profileId": "65f...", "completedActivityIds": ["color-01-listen"] }
```

Respuesta: bonus de XP (una sola vez), insignia si aplica, mundos desbloqueados.

## Rate limiting

- `POST /parent/unlock`: 5 intentos / 5 minutos por sesion.
- `POST /profiles`: 10 / hora por sesion.
- Resto: limite amplio configurable.

## Cabeceras y seguridad

- `Content-Type: application/json`.
- `Cache-Control: no-store` en todo lo que dependa del perfil.
- Limite de body: 64 KB.
- Validacion Zod de params y body.
- Verificacion de pertenencia del perfil en cada operacion.
