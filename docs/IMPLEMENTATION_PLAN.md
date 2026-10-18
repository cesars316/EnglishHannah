# IMPLEMENTATION_PLAN - English Quest

> Checklist vivo. Se actualiza al cerrar cada fase. Fuente de verdad del contenido:
> `English_Quest_Documento_Maestro.md` (raiz del repo).

**Estado actual:** Fase 0 completada · Fase 1 completada · Fase 2 completada
(rebanada vertical jugable en local) · Fase 3 completada (API `/api/v1` + MongoDB;
el servidor es la autoridad) · Fase 4 completada (progreso y panel parental) ·
Fase 5 completada (voz y camara opcionales) · Fase 6 completada (calidad y guia de
despliegue, sin publicar) · Fase 7 en curso (mini-historias entregadas; faltan los
mundos 5-12, el ajuste de dificultad y el offline parcial).

## Decisiones del propietario

- [x] Proyecto en la raiz `C:\INGLES` (el doc maestro no se modifica).
- [x] MongoDB local mediante Docker Compose; Atlas solo por `MONGODB_URI`.
- [x] Identidad: sesion de dispositivo + codigo parental (ver ADR 0003).

## Fase 0 - Inspeccion, plan y documentacion

- [x] Inspeccion de directorio, Git, Node, npm y dependencias.
- [x] `git init` (`main`), `.gitignore`, `.env.example` sin secretos.
- [x] `docs/ARCHITECTURE.md`.
- [x] `docs/IMPLEMENTATION_PLAN.md` (este archivo).
- [x] `docs/API.md`.
- [x] `docs/CONTENT_GUIDE.md`.
- [x] `docs/PRIVACY.md`.
- [x] ADRs 0001-0005.
- [x] `README.md` reproducible.
- [x] Commit de Fase 0 (`ba9937a`).

## Fase 1 - Fundacion

- [x] `package.json` con versiones fijadas + lockfile.
- [x] `tsconfig.json` estricto (`strict`, `noUncheckedIndexedAccess`).
- [x] Next.js 16 App Router + `globals.css` + design tokens.
- [x] Tailwind 4 + PostCSS.
- [x] ESLint (flat) + Prettier.
- [x] Vitest + RTL + jsdom configurados.
- [x] Playwright configurado (escritorio + movil) con E2E en `tests/e2e`.
- [x] `docker-compose.yml` (MongoDB 8 standalone; Atlas por `MONGODB_URI`).
- [x] Sistema visual (`src/components/ui`): Button, LinkButton, Card, Pill,
      ProgressBar, Modal, Spinner, StatusMessage, EmptyState, PageHeader, Icon,
      AvatarIllustration, Mascot.
- [x] Layout responsive (>=360 px) + navegacion principal (`AppShell`, `GameNav`).
- [x] Pantallas: landing, onboarding, seleccion de perfil, home, mapa,
      detalle de mundo, intro/ejecucion de leccion, tarjeta de vocabulario,
      minijuego, feedback, resumen de sesion, coleccion, zona parental
      (progreso + ajustes), privacidad, sin conexion, error y 404.
- [x] Accesibilidad base: foco visible, teclado, `prefers-reduced-motion`,
      objetivos tactiles >= 44 px.
- [x] CI GitHub Actions (lint + typecheck + contenido + test + build; integracion
      con MongoDB; E2E en `main`).
- [x] Lint, tipos, contenido, pruebas y build en verde (`npm run verify`).

**Aceptacion:** la app arranca, las rutas principales son navegables, y lint/test/build pasan. ✅

## Fase 2 - Contenido y juego (rebanada vertical)

- [x] Esquema de contenido tipado (`src/types/content.ts`).
- [x] `scripts/validate-content.ts` + `src/content/validate.ts` (0 errores, 0 avisos).
- [x] Mundos Hello Village, Color Forest, Number Beach, Animal Park.
- [x] Vocabulario (48 palabras) con SVG original + ejemplo + metadatos.
- [x] Motor de actividades: `listen-and-choose`, `image-choice`, `matching-pairs`,
      `word-builder`, `sentence-completion` (56 actividades).
- [x] `SpeechService` (Web Speech) con fallback visual/texto.
- [x] Feedback amable y flujo de mision.
- [x] Resumen de sesion.
- [x] Recompensas locales (config central en `src/config/rewards.ts`).
- [x] Progreso local: dominio provisional, repaso espaciado, insignias.
- [x] Correccion en servidor (Server Action) sin enviar `answerKey` al navegador.
- [x] Los cuatro mundos jugables de principio a fin sin backend.

**Aceptacion:** los cuatro mundos MVP jugables de principio a fin sin backend;
validacion de contenido sin fallos. ✅

## Fase 3 - Backend y persistencia

- [x] `src/server/env.ts` con validacion al arrancar.
- [x] `src/server/db/*` (cliente Mongo, colecciones, indices).
- [x] `scripts/seed.ts` idempotente.
- [x] Repositorios, servicios y casos de uso.
- [x] Endpoints `/api/v1` con sobre de respuesta y `requestId`.
- [x] Validacion Zod, limite de body, rate limiting.
- [x] Cookie de sesion firmada + verificacion de pertenencia.
- [x] Evaluacion server-side de actividades + idempotencia.
- [x] Pruebas de integracion con Mongo.
- [x] Migracion del cliente: el servidor es la autoridad y el navegador solo
      guarda la preferencia `eq.activeProfileId` en `localStorage`.
- [x] Retirada de los modulos legacy de `localStorage`.
- [x] `src/types/api.ts` como fuente unica de los tipos de cable.

**Aceptacion:** al recargar persiste el progreso; sin doble recompensa; la API no
filtra respuestas correctas. ✅

## Fase 4 - Progreso y panel parental

- [x] Reglas de desbloqueo de mundos (`applyUnlocks`, en servidor).
- [x] XP, monedas e insignias (config central en `src/config/rewards.ts`).
- [x] Dominio provisional + repaso espaciado simple (calculado en servidor).
- [x] Panel parental con datos reales (`GET /parent/overview`) + proteccion por
      codigo (`/parent/*`).
- [x] Exportar (`GET /profiles/:id/export`) y borrar perfil
      (`DELETE /profiles/:id`, con autorizacion parental).
- [x] Pagina de privacidad; reinicio de progreso (`DELETE /profiles/:id/progress`)
      y cambio de codigo (`POST /parent/passcode`).
- [x] Ajustes de permisos (microfono, camara, sonido, movimiento reducido) en el
      panel parental: se guardan en el servidor (cookie parental) y con aviso de
      error si la sesion de adulto caduca.
- [x] Contenido de privacidad actualizado tras la Fase 3: pagina de privacidad y
      `docs/PRIVACY.md` describen MongoDB y el codigo cifrado en servidor (el
      progreso ya no vive en el navegador).
- [x] Pruebas de integracion de progreso (`tests/integration/progress.test.ts`):
      resumen coherente con intentos reales (XP, aciertos por habilidad, tiempo).

**Aceptacion:** estadisticas coherentes con los intentos reales. ✅

## Fase 5 - Voz y camara (opcionales)

- [x] `src/features/speech/recognition.ts`: deteccion de soporte, mapeo de errores
      y normalizacion del texto reconocido (probado sin navegador real).
- [x] `speak-and-check` con fallback manual «Ya lo dije» y locucion (TTS).
- [x] `camera-hunt` con `getUserMedia` explicito, vista previa temporal,
      indicador visible y `track.stop()` al salir.
- [x] Estados de permiso denegado, ausente y error, con alternativa sin medios.
- [x] Contenido: actividades `color-01-speak` y `color-02-hunt` en Color Forest.
- [x] Pruebas: `tests/unit/media.test.ts` (logica pura) y
      `tests/components/media-views.test.tsx` (fallbacks sin permisos/APIs).

**Aceptacion:** el juego funciona sin permisos ni APIs; no se guardan medios. ✅

## Fase 6 - Calidad y despliegue (sin publicar)

- [x] Pruebas unitarias, de integracion y E2E (smoke + flujos principales).
- [x] Revision de accesibilidad (lang, headings, noindex en zonas privadas) y responsive 360 px.
- [x] Auditoria de dependencias y seguridad (documentada; advisories dev-only conocidos).
- [x] README reproducible completo (deploy link añadido).
- [x] CI completo (quality + integration con MongoDB).
- [x] Instrucciones de despliegue (`docs/DEPLOYMENT.md`, no ejecutado).

**Aceptacion:** build limpio, pruebas criticas verdes, guia reproducible.

## Fase 7 - Expansion de contenido

- [ ] Mundos 5-12.
- [x] Mini-historias + quiz (`story-quiz`, motor, vista y contenido en los cuatro
      mundos MVP; cada mundo nuevo incluira su propia historia final).
- [ ] Ajuste de dificultad segun progreso.
- [ ] PWA / offline parcial si es viable.

## Checklist de aceptacion final (documento maestro, seccion 21)

- [x] El proyecto se instala desde cero siguiendo el README.
- [x] El desarrollo local funciona en Windows.
- [x] La interfaz es responsive y amigable para una niña de 9 años.
- [x] Existen los cuatro mundos MVP con contenido real.
- [x] Las tarjetas muestran palabra, traduccion, ejemplo e imagen/visual.
- [x] El audio se reproduce o se ofrece un fallback claro.
- [x] Los cinco minijuegos MVP son funcionales.
- [x] Las respuestas incorrectas generan ayuda amable.
- [x] XP y recompensas no se duplican con reintentos (idempotencia HTTP por
      `clientAttemptId`).
- [x] Los mundos se desbloquean segun reglas reales.
- [x] MongoDB persiste progreso (servidor como autoridad, ADR 0003/0004).
- [x] El panel parental muestra informacion util y real (datos del servidor).
- [x] El perfil y sus datos se pueden borrar con autorizacion.
- [x] El microfono es opcional (Fase 5) y hoy no se usa.
- [x] La camara es opcional, se activa explicitamente y se apaga al salir. (Fase 5)
- [x] No se almacenan audio, fotos ni video.
- [x] Los secretos no estan versionados.
- [x] Validacion de contenido y pruebas automatizadas funcionan.
- [x] Lint, tests y build pasan.
- [x] README, arquitectura, API y privacidad estan documentados.
- [x] No hay despliegue publico sin autorizacion.

## Limitaciones conocidas (Fases 2-3)

- **MongoDB local:** la imagen `mongo:8.0` de `docker-compose.yml` no se pudo
  descargar en este entorno (fallo de DNS del CDN). El desarrollo y las pruebas
  se validaron contra el MongoDB 7.0 ya existente en `localhost:27017`
  (bases `english_quest` y `english_quest_test`). El `docker-compose.yml` se
  mantiene como objetivo documentado.
- El servidor no usa transacciones: el MongoDB local es standalone (sin replica
  set). La idempotencia se apoya en indices unicos y en `$addToSet`/`upsert` por
  clave natural, no en transacciones multi-documento.
- Si falta `AUTH_SECRET` se usa un secreto efimero por proceso (las sesiones no
  sobreviven a un reinicio); se avisa por consola. Sin `MONGODB_URI` la API
  responde `DB_UNAVAILABLE` (503).
- `notFound()` en rutas dinamicas devuelve estado HTTP 200 cuando la respuesta ya
  empezo a transmitirse (comportamiento documentado de Next.js 16); la interfaz
  404 se muestra igualmente y va con `noindex`.
- El desbloqueo parental de 30 minutos no se revoca automaticamente al caducar si
  la pagina permanece abierta.
- `npm audit` reporta 5 avisos altos en una cadena **solo de desarrollo**
  (`braces@3.0.3` bajo `micromatch` ← `fast-glob` ← `@next/eslint-plugin-next` ←
  `eslint-config-next`); `braces@3.0.3` ya es la ultima version publicada y
  `npm audit --omit=dev` da **0 vulnerabilidades**. Sin impacto en produccion.
- Los navegadores de Playwright requieren descarga (~200 MiB); en este entorno el
  CDN fallo de forma intermitente pero el reintento funciono. Los E2E corren en
  local (escritorio + movil) y en CI (`npx playwright install --with-deps`).
