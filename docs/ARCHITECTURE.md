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

| Capa               | Ubicacion        | Regla                                                                                 |
| ------------------ | ---------------- | ------------------------------------------------------------------------------------- |
| Rutas y pantallas  | `src/app`        | Server Components por defecto; solo `use client` cuando hace falta.                   |
| Componentes UI     | `src/components` | Presentacionales y accesibles; sin acceso a datos.                                    |
| Dominio / features | `src/features`   | Motor de actividades, progreso, recompensas, speech, camara. Logica pura y testeable. |
| Contenido          | `src/content`    | Fuente unica de verdad del contenido pedagogico (ADR 0002).                           |
| Servidor           | `src/server`     | `db`, `repositories`, `services`, `use-cases`, `auth`, `validation`, `http`.          |
| Tipos compartidos  | `src/types`      | Contratos cliente/servidor.                                                           |
| Config compartida  | `src/config`     | XP, monedas, umbrales, limites, constantes de juego.                                  |

Regla de oro: **la UI nunca importa `src/server`** y **`src/server` nunca importa
componentes de React**.

## 3. Arbol de carpetas

```
english-quest/
├── public/                      # SVG originales, iconos PWA y sw.js
├── src/
│   ├── app/
│   │   ├── (public)/            # landing, privacidad, onboarding
│   │   ├── (game)/              # home, map, world, lesson, play, collection
│   │   ├── padres/              # zona parental (ruta /padres)
│   │   ├── api/v1/              # route handlers
│   │   ├── layout.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   ├── manifest.ts          # manifiesto PWA (instalable)
│   │   └── globals.css
│   ├── components/{ui,activities,layout}
│   ├── features/{worlds,activities,progress,rewards,speech,camera,profile,parent,collection,privacy}
│   ├── server/{db,repositories,services,use-cases,auth,validation,http}
│   ├── content/{worlds,vocabulary,lessons,activities,index.ts,validate.ts}
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

| Coleccion          | Indice                                               |
| ------------------ | ---------------------------------------------------- |
| `profiles`         | `{ ownerId: 1 }`                                     |
| `progress`         | `{ profileId: 1, entityType: 1, entityId: 1 }` unico |
| `progress`         | `{ profileId: 1, nextReviewAt: 1 }`                  |
| `activityAttempts` | `{ profileId: 1, clientAttemptId: 1 }` unico         |
| `activityAttempts` | `{ profileId: 1, createdAt: -1 }`                    |
| `activityAttempts` | `{ profileId: 1, activityId: 1 }`                    |
| `gameState`        | `_id` (profileId)                                    |

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

El **servidor es la autoridad** (ADR 0003/0004). El cliente nunca calcula XP,
dominio ni desbloqueos: los pide a `/api/v1` y los cachea.

- Cada pantalla pide los datos que necesita (Server Components cuando es estatico;
  `src/features/api/client.ts` en el cliente).
- Los stores de cliente (`src/features/*/remote-store.ts`) son almacenes externos
  en memoria, leidos con `useSyncExternalStore`. `getSnapshot` devuelve siempre la
  misma referencia mientras el dato no cambie.
- Las respuestas de jugar (`POST .../answer`, `POST .../complete`) ya traen el
  `gameState` actualizado: se aplica sin una segunda peticion
  (`applyGameState`) y se invalida el resumen (`invalidateSummary`).
- `localStorage` guarda **unicamente** la preferencia `eq.activeProfileId` (que
  perfil esta activo en este dispositivo). No hay progreso ni codigo parental en
  el navegador.
- El codigo parental se verifica siempre en el servidor (scrypt); la comprobacion
  de formato en el cliente es solo para dar feedback inmediato.
- React `useState`/`useReducer` para el estado de la sesion en curso.

## 7. Seguridad

- `AUTH_SECRET` firma la cookie de sesion; si falta, se usa un secreto efimero por
  proceso con aviso por consola.
- Cookie `eq_session` firmada (HMAC-SHA256, httpOnly, 180 dias): el servidor
  **nunca** confia en un `ownerId` enviado por el navegador.
- Cookie `eq_parent` (httpOnly, 30 min) para las acciones sensibles: borrar,
  ajustes, exportar y cambiar el codigo.
- Codigo parental con `scrypt(codigo, sal)`; nunca se guarda en claro. Limite de
  intentos (`/parent/unlock`: 5 cada 5 min).
- Verificacion de pertenencia del perfil en cada operacion (404 si no es del
  `ownerId`).
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
