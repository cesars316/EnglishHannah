# Arquitectura - English Quest

> Documento vivo. Ver tambien `docs/adr/` para el registro de decisiones.

## 1. Vision general

English Quest es una aplicacion web educativa (aventura de vocabulario ingles A1)
construida como **monolito modular** full-stack con Next.js (App Router).

```
+-------------------------------+        +------------------------------+
|  Navegador (React 19 / TS)    |        |  Servidor (Next.js)          |
|                               |        |                              |
|  app/ (rutas + pantallas)     |  HTTP  |  app/api/v1/** (route        |
|  components/ (UI)             | <----> |  handlers finos)             |
|  features/* (estado + engine) |  JSON  |  server/use-cases (logica)   |
|  content/ (contenido A1)      |        |  server/repositories (Mongo) |
+-------------------------------+        +---------------+--------------+
             ^                                          |
             | Web Speech API (TTS/ASR), getUserMedia    | driver oficial
             | (solo cliente, sin persistencia)          v
             |                                   +------------------+
             |                                   |  MongoDB         |
             `-----------------------------------|  (Atlas / local) |
                                                 +------------------+
```

## 2. Limites de responsabilidad

| Capa | Ubicacion | Regla |
| --- | --- | --- |
| Rutas y pantallas | `src/app` | Server Components por defecto; solo `use client` cuando hace falta. |
| Componentes UI | `src/components` | Presentacionales y accesibles; sin acceso a datos. |
| Dominio / features | `src/features` | Motor de actividades, progreso, recompensas, speech, camara. Logica pura y testeable. |
| Contenido | `src/content` | Fuente unica de verdad del contenido pedagogico (ADR 0002). |
| Servidor | `src/server` | `db`, `repositories`, `services`, `use-cases`, `auth`, `validation`, `http`. |
| Tipos compartidos | `src/types` | Contratos cliente/servidor. |
| Config compartida | `src/config` | XP, monedas, umbrales, limites, constantes de juego. |

Regla de oro: **la UI nunca importa `src/server`** y **`src/server` nunca importa
componentes de React**.

## 3. Arbol de carpetas

```
english-quest/
├── public/                      # SVG originales, manifest
├── src/
│   ├── app/
│   │   ├── (public)/            # landing, privacidad, onboarding
│   │   ├── (game)/              # home, map, world, lesson, play, collection
│   │   ├── parent/              # zona parental
│   │   ├── api/v1/              # route handlers
│   │   ├── layout.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   └── globals.css
│   ├── components/{ui,game,map,vocabulary,parent,layout}
│   ├── features/{worlds,lessons,activities,progress,rewards,speech,camera,profile}
│   ├── server/{db,repositories,services,use-cases,auth,validation,http}
│   ├── content/{worlds,vocabulary,activities,lessons,stories}
│   ├── config/
│   ├── lib/
│   └── types/
├── scripts/{seed.ts,validate-content.ts}
├── tests/{unit,integration,e2e}
├── docs/{adr,ARCHITECTURE.md,IMPLEMENTATION_PLAN.md,API.md,CONTENT_GUIDE.md,PRIVACY.md}
├── docker-compose.yml
└── ...
```

## 4. Modelo de datos (MongoDB)

Colecciones y responsabilidades (esquemas completos en `docs/API.md` y
`src/server/db/collections.ts`):

- `owners` - identidad del dispositivo/adulto + hash del codigo parental.
- `profiles` - perfil infantil (alias, avatar, ajustes).
- `progress` - dominio por entidad (`vocabulary` | `skill` | `world` | `lesson`).
- `activityAttempts` - intentos con `clientAttemptId` (idempotencia).
- `gameState` - XP, monedas, desbloqueos, insignias.

Indices (creados por `scripts/seed.ts`, idempotentes):

| Coleccion | Indice |
| --- | --- |
| `profiles` | `{ ownerId: 1 }` |
| `progress` | `{ profileId: 1, entityType: 1, entityId: 1 }` unico |
| `progress` | `{ profileId: 1, nextReviewAt: 1 }` |
| `activityAttempts` | `{ profileId: 1, clientAttemptId: 1 }` unico |
| `activityAttempts` | `{ profileId: 1, createdAt: -1 }` |
| `activityAttempts` | `{ profileId: 1, activityId: 1 }` |
| `gameState` | `_id` (profileId) |

## 5. Motor de actividades

Contrato en `src/features/activities/engine/types.ts`. Tipos soportados en el MVP:

`listen-and-choose`, `image-choice`, `matching-pairs`, `word-builder`,
`sentence-completion`. Extensiones posteriores: `speak-and-check`, `camera-hunt`,
`story-quiz`.

Cada actividad declara: `id`, `type`, `skill`, `prompt` (es/en), `content`,
`answerKey`, `hints`, `xp`, `difficulty`, `vocabularyIds`, `audio`, `contentVersion`.

`evaluateActivity(activity, response)` es pura y se comparte cliente/servidor
(ADR 0004).

## 6. Persistencia y estado en cliente

- Los datos de juego se obtienen de la API `/api/v1` (Server Components + `fetch`
  sin cache para progreso).
- React `useState`/`useReducer` para estado de sesion en curso.
- Sin libreria de estado global en el MVP.
- Si la red falla, el progreso se marca como "pendiente" y se ofrece reintento.

## 7. Seguridad

- `AUTH_SECRET` valida al arrancar (`src/server/env.ts`).
- Cookie de sesion firmada (HMAC). Verificacion de pertenencia en cada operacion.
- Validacion Zod de body/params; limite de tamaño; rate limiting en endpoints
  sensibles; sin stack traces en respuestas.
- Cabeceras de seguridad y CSP documentada.
- `noindex` en zona parental y perfiles.

## 8. Calidad

- TypeScript `strict` + `noUncheckedIndexedAccess`.
- ESLint flat config + Prettier.
- Vitest (unitarias + componentes con RTL) e integracion con Mongo.
- Playwright para los 12 escenarios E2E del documento maestro.
- CI: lint + typecheck + test + build en cada push/PR.
- `npm run validate:content` antes de desplegar.
