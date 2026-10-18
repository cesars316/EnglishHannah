# English Quest

Aventura educativa para aprender ingles (nivel A1) jugando. La jugadora ayuda a
reconstruir **English Island**, cuyos mundos han perdido sus palabras en ingles.

- App web: **Next.js 16 + React 19 + TypeScript estricto + Tailwind CSS 4**
- Persistencia: **MongoDB** (driver oficial), local por Docker o MongoDB Atlas Free
- Interfaz de navegacion en **español**; palabras, frases y audio en **ingles**
- Sin publicidad, sin chat, sin rastreadores y sin almacenar audio, fotos ni video.

Documentacion completa en [`docs/`](./docs):

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) - arquitectura y limites por capa
- [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md) - plan y checklist por fases
- [`docs/API.md`](./docs/API.md) - contratos de la API `/api/v1`
- [`docs/CONTENT_GUIDE.md`](./docs/CONTENT_GUIDE.md) - como añadir contenido
- [`docs/PRIVACY.md`](./docs/PRIVACY.md) - privacidad y datos infantiles
- [`docs/adr/`](./docs/adr) - decisiones de arquitectura

## Requisitos

| Herramienta    | Version                       |
| -------------- | ----------------------------- |
| Node.js        | >= 20.9 (probado con 24.21.0) |
| npm            | >= 10 (probado con 11.19.0)   |
| Docker Desktop | opcional, para MongoDB local  |

## Puesta en marcha (desde cero)

MongoDB es necesario: el servidor es la autoridad del progreso y los perfiles
(ADR 0003/0004). La API responde `503 DB_UNAVAILABLE` si no hay base de datos.

### MongoDB local con Docker (recomendado)

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de entorno y generar el secreto de sesion
cp .env.example .env.local
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
#   -> pega el resultado en AUTH_SECRET dentro de .env.local

# 3. Levantar MongoDB local (Docker)
npm run db:up

# 4. Crear indices y contenido de referencia (idempotente)
npm run seed

# 5. Arrancar en desarrollo
npm run dev
#   -> http://localhost:3000
```

En Windows PowerShell el comando de copia es:

```powershell
Copy-Item .env.example .env.local
```

> `AUTH_SECRET` es obligatorio en produccion. Si falta, el servidor usa un
> secreto efimero por proceso y avisa por consola (las sesiones no sobreviven a
> un reinicio). `MONGODB_URI` tambien debe estar definido.

### Recorrido de la app

1. `/` - portada; pulsa **Empezar la aventura**.
2. `/empezar` - crea un perfil (alias + avatar).
3. `/jugar` - panel de inicio con la siguiente mision.
4. `/jugar/mapa` - mapa de mundos; abre **Hello Village**.
5. `/jugar/mundo/hello-village` -> **Jugar la mision** -> `/jugar/leccion/hello-01`.
6. Resuelve las actividades, mira el feedback y el resumen con XP y monedas.
7. `/jugar/practicar` - repaso espaciado; `/coleccion` - insignias y palabras.
8. `/padres` - zona de adultos (crea un codigo la primera vez); desde ahi puedes
   ver el progreso de cada perfil, exportar o borrar datos y cambiar el codigo.

### Comprobacion completa

```bash
npm run verify   # contenido + lint + tipos + pruebas + build
```

### Usar MongoDB Atlas en vez de Docker

1. Crea un cluster gratuito en MongoDB Atlas.
2. Copia la cadena de conexion y pegala en `MONGODB_URI` dentro de `.env.local`.
3. Ejecuta `npm run dev`.

No se necesitan mas cambios de codigo.

## Scripts

| Comando                             | Descripcion                                        |
| ----------------------------------- | -------------------------------------------------- |
| `npm run dev`                       | Servidor de desarrollo                             |
| `npm run build`                     | Build de produccion                                |
| `npm run start`                     | Servir el build                                    |
| `npm run lint`                      | ESLint                                             |
| `npm run lint:fix`                  | ESLint con autocorreccion                          |
| `npm run format`                    | Prettier                                           |
| `npm run typecheck`                 | TypeScript sin emitir                              |
| `npm run test`                      | Pruebas unitarias y de componentes (Vitest)        |
| `npm run test:watch`                | Vitest en modo watch                               |
| `npm run test:coverage`             | Vitest con cobertura                               |
| `npm run test:integration`          | Pruebas de integracion (requiere MongoDB)          |
| `npm run test:e2e`                  | Playwright E2E (navegadores instalados localmente) |
| `npm run validate:content`          | Valida el contenido pedagogico                     |
| `npm run seed`                      | Crea indices y datos de referencia (idempotente)   |
| `npm run verify`                    | Contenido + lint + tipos + pruebas + build         |
| `npm run db:up` / `npm run db:down` | MongoDB local con Docker                           |

## Rutas

| Ruta                           | Contenido                                    |
| ------------------------------ | -------------------------------------------- |
| `/`                            | Portada publica                              |
| `/empezar`, `/perfiles`        | Alta y seleccion de perfil                   |
| `/privacidad`, `/sin-conexion` | Privacidad y aviso sin conexion              |
| `/jugar`                       | Inicio: siguiente mision, repaso y coleccion |
| `/jugar/mapa`                  | Mapa de mundos y estado de desbloqueo        |
| `/jugar/mundo/[worldId]`       | Detalle del mundo y sus misiones             |
| `/jugar/leccion/[lessonId]`    | Sesion de mision (actividades + resumen)     |
| `/jugar/practicar`             | Repaso espaciado                             |
| `/coleccion`                   | Insignias, monedas y palabras practicadas    |
| `/padres`, `/padres/ajustes`   | Zona de adultos (protegida por codigo)       |

## Estructura

Ver [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md). Resumen:

```
src/app        rutas y pantallas (App Router) + API `/api/v1`
src/components componentes de UI
src/features   dominio: actividades, progreso, recompensas, speech, camara
src/content    contenido pedagogico (fuente de verdad)
src/config     XP, monedas, umbrales y limites
src/lib        utilidades (texto, aleatoriedad, almacenamiento, formato)
src/types      contratos compartidos (incl. `api.ts` para el cable)
src/server     env, db, repositorios, casos de uso, auth y http de la API
scripts/       validate-content.ts, seed.ts
docs/          documentacion y ADRs
tests/         unit, components, integration, e2e
```

## Estado del proyecto

Ver el checklist vivo en [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md).

- **Fase 0** (documentacion y arquitectura), **Fase 1** (fundacion), **Fase 2**
  (contenido + rebanada vertical jugable), **Fase 3** (API `/api/v1` + MongoDB),
  **Fase 4** (panel parental y privacidad), **Fase 5** (voz y camara opcionales) y
  **Fase 6** (calidad: pruebas, accesibilidad, CI y guia de despliegue) estan
  completadas. La **Fase 7** (expansion de contenido) esta completa en contenido:
  **12 mundos**, **37 lecciones**, **188 actividades** y **129 palabras**, con
  mini-historias (`story-quiz`) en la mision final de cada mundo y **ajuste de
  dificultad** en el repaso (un nivel amable `gentle`/`steady`/`champion` se
  deriva del progreso y ordena la sesion; el contenido no cambia); queda
  valorar el offline parcial.
- Hoy el progreso vive en MongoDB y el **servidor es la autoridad**: el navegador
  solo guarda que perfil esta activo (`localStorage`).
- Calidad: `npm run validate:content`, `typecheck`, `lint`, pruebas unitarias/de
  componentes, pruebas de integracion (MongoDB) y **E2E de Playwright**
  (`npm run test:e2e`, escritorio + movil). CI en `.github/workflows/ci.yml`.
- Limitaciones conocidas al final de `docs/IMPLEMENTATION_PLAN.md` (por ejemplo,
  la imagen `mongo:8.0` de Docker no se pudo descargar en este entorno; se valido
  contra un MongoDB 7.0 local).

## Privacidad

Lee [`docs/PRIVACY.md`](./docs/PRIVACY.md). Resumen: solo se guarda el alias, el
avatar y el progreso de aprendizaje. Microfono y camara son opcionales, requieren
accion explicita y **nunca** se guardan grabaciones, fotos ni video.

## Despliegue

Instrucciones en [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md). **No desplegar sin
autorizacion explicita del propietario.**
