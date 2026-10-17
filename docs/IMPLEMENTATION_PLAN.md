# IMPLEMENTATION_PLAN - English Quest

> Checklist vivo. Se actualiza al cerrar cada fase. Fuente de verdad del contenido:
> `English_Quest_Documento_Maestro.md` (raiz del repo).

**Estado actual:** Fase 0 completada · Fase 1 en curso.

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
- [ ] `README.md` reproducible.
- [ ] Commit de Fase 0.

## Fase 1 - Fundacion

- [ ] `package.json` con versiones fijadas + lockfile.
- [ ] `tsconfig.json` estricto (`strict`, `noUncheckedIndexedAccess`).
- [ ] Next.js 16 App Router + `globals.css` + design tokens.
- [ ] Tailwind 4 + PostCSS.
- [ ] ESLint (flat) + Prettier.
- [ ] Vitest + RTL + jsdom configurados.
- [ ] Playwright configurado.
- [ ] `docker-compose.yml` (MongoDB 8 con replica set).
- [ ] Sistema visual (`src/components/ui`): Button, Card, ProgressBar, Modal,
      OptionButton, Badge, Spinner, EmptyState, ErrorState, PageHeader.
- [ ] Layout responsive (>=360 px) + navegacion principal.
- [ ] Pantallas: landing, onboarding adulto, seleccion de perfil, home, mapa,
      detalle de mundo, intro de leccion, tarjeta de vocabulario, minijuego,
      feedback, resumen de sesion, coleccion, panel parental, privacidad/ajustes,
      error/offline, 404.
- [ ] Accesibilidad base: foco visible, teclado, `prefers-reduced-motion`.
- [ ] CI GitHub Actions (lint + typecheck + test + build).
- [ ] Lint, test y build en verde.

**Aceptacion:** la app arranca, las rutas principales son navegables, y lint/test/build pasan.

## Fase 2 - Contenido y juego (rebanada vertical)

- [ ] Esquema de contenido tipado (`src/types/content.ts`).
- [ ] `scripts/validate-content.ts`.
- [ ] Mundos Hello Village, Color Forest, Number Beach, Animal Park.
- [ ] Vocabulario con SVG original + ejemplo + metadatos.
- [ ] Motor de actividades: `listen-and-choose`, `image-choice`, `matching-pairs`,
      `word-builder`, `sentence-completion`.
- [ ] `SpeechService` (Web Speech) con fallback visual/texto.
- [ ] Feedback amable y flujo de mision.
- [ ] Resumen de sesion.
- [ ] Recompensas locales (borrador, config central).
- [ ] Color Forest jugable de principio a fin.

**Aceptacion:** Colors jugable completo sin backend; validacion de contenido sin fallos.

## Fase 3 - Backend y persistencia

- [ ] `src/server/env.ts` con validacion al arrancar.
- [ ] `src/server/db/*` (cliente Mongo, colecciones, indices).
- [ ] `scripts/seed.ts` idempotente.
- [ ] Repositorios, servicios y casos de uso.
- [ ] Endpoints `/api/v1` con sobre de respuesta y `requestId`.
- [ ] Validacion Zod, limite de body, rate limiting.
- [ ] Cookie de sesion firmada + verificacion de pertenencia.
- [ ] Evaluacion server-side de actividades + idempotencia.
- [ ] Pruebas de integracion con Mongo.

**Aceptacion:** al recargar persiste el progreso; sin doble recompensa; la API no
filtra respuestas correctas.

## Fase 4 - Progreso y panel parental

- [ ] Reglas de desbloqueo de mundos.
- [ ] XP, monedas e insignias (config central).
- [ ] Dominio provisional + repaso espaciado simple.
- [ ] Panel parental con datos reales + proteccion por codigo.
- [ ] Exportar y borrar perfil.
- [ ] Pagina de privacidad y ajustes de permisos.

**Aceptacion:** estadisticas coherentes con los intentos reales.

## Fase 5 - Voz y camara (opcionales)

- [ ] `SpeechRecognitionService` con deteccion de soporte.
- [ ] `speak-and-check` con fallback manual "Ya lo dije".
- [ ] `camera-hunt` con `getUserMedia` explicito, indicador y `track.stop()`.
- [ ] Estados de permiso denegado, ausente y error.

**Aceptacion:** el juego funciona sin permisos ni APIs; no se guardan medios.

## Fase 6 - Calidad y despliegue (sin publicar)

- [ ] Pruebas unitarias, de integracion y los 12 escenarios E2E.
- [ ] Revision de accesibilidad y responsive 360 px.
- [ ] Auditoria de dependencias y seguridad.
- [ ] README reproducible completo.
- [ ] CI completo.
- [ ] Instrucciones de despliegue (no ejecutado).

**Aceptacion:** build limpio, pruebas criticas verdes, guia reproducible.

## Fase 7 - Expansion de contenido

- [ ] Mundos 5-12.
- [ ] Mini-historias + quiz.
- [ ] Ajuste de dificultad segun progreso.
- [ ] PWA / offline parcial si es viable.

## Checklist de aceptacion final (documento maestro, seccion 21)

- [ ] El proyecto se instala desde cero siguiendo el README.
- [ ] El desarrollo local funciona en Windows.
- [ ] La interfaz es responsive y amigable para una niña de 9 años.
- [ ] Existen los cuatro mundos MVP con contenido real.
- [ ] Las tarjetas muestran palabra, traduccion, ejemplo e imagen.
- [ ] El audio se reproduce o se ofrece un fallback claro.
- [ ] Los cinco minijuegos MVP son funcionales.
- [ ] Las respuestas incorrectas generan ayuda amable.
- [ ] XP y recompensas no se duplican con reintentos HTTP.
- [ ] Los mundos se desbloquean segun reglas reales.
- [ ] MongoDB persiste progreso.
- [ ] El panel parental muestra informacion util y real.
- [ ] El perfil y sus datos se pueden borrar con autorizacion.
- [ ] El microfono es opcional y tiene fallback.
- [ ] La camara es opcional, se activa explicitamente y se apaga al salir.
- [ ] No se almacenan audio, fotos ni video.
- [ ] Los secretos no estan versionados.
- [ ] Validacion de contenido y pruebas automatizadas funcionan.
- [ ] Lint, tests y build pasan.
- [ ] README, arquitectura, API y privacidad estan documentados.
- [ ] No hay despliegue publico sin autorizacion.
