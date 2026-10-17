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

### Camino rapido (sin base de datos, Fase 2)

La app funciona por completo en local: el progreso se guarda en este dispositivo.
No hace falta MongoDB, ni `.env.local`, para jugar los cuatro mundos MVP.

```bash
npm install   # 1. Instalar dependencias
npm run dev   # 2. Arrancar en desarrollo -> http://localhost:3000
```

### Con MongoDB (a partir de la Fase 3)

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de entorno y generar el secreto de sesion
cp .env.example .env.local
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
#   -> pega el resultado en AUTH_SECRET dentro de .env.local

# 3. Levantar MongoDB local (Docker)
npm run db:up

# 4. Arrancar en desarrollo
npm run dev
#   -> http://localhost:3000
```

En Windows PowerShell el comando de copia es:

```powershell
Copy-Item .env.example .env.local
```

> El paso de creacion de indices y datos iniciales (`scripts/seed.ts`) y los
> endpoints `/api/v1` se incorporan en la Fase 3. Hoy la app funciona sin
> MongoDB (modo local descrito arriba).

### Recorrido de la Fase 2

1. `/` - portada; pulsa **Empezar la aventura**.
2. `/empezar` - crea un perfil (alias + avatar).
3. `/jugar` - panel de inicio con la siguiente mision.
4. `/jugar/mapa` - mapa de mundos; abre **Hello Village**.
5. `/jugar/mundo/hello-village` -> **Jugar la mision** -> `/jugar/leccion/hello-01`.
6. Resuelve las actividades, mira el feedback y el resumen con XP y monedas.
7. `/jugar/practicar` - repaso espaciado; `/coleccion` - insignias y palabras.
8. `/padres` - zona de adultos (crea un codigo la primera vez).

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

| Comando                             | Descripcion                                       |
| ----------------------------------- | ------------------------------------------------- |
| `npm run dev`                       | Servidor de desarrollo                            |
| `npm run build`                     | Build de produccion                               |
| `npm run start`                     | Servir el build                                   |
| `npm run lint`                      | ESLint                                            |
| `npm run lint:fix`                  | ESLint con autocorreccion                         |
| `npm run format`                    | Prettier                                          |
| `npm run typecheck`                 | TypeScript sin emitir                             |
| `npm run test`                      | Pruebas unitarias y de componentes (Vitest)       |
| `npm run test:watch`                | Vitest en modo watch                              |
| `npm run test:coverage`             | Vitest con cobertura                              |
| `npm run test:integration`          | Pruebas de integracion (requiere MongoDB, Fase 3) |
| `npm run test:e2e`                  | Playwright E2E (navegadores en Fase 6)            |
| `npm run validate:content`          | Valida el contenido pedagogico                    |
| `npm run verify`                    | Contenido + lint + tipos + pruebas + build        |
| `npm run db:up` / `npm run db:down` | MongoDB local con Docker (Fase 3)                 |

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
src/app        rutas y pantallas (App Router)
src/components componentes de UI
src/features   dominio: actividades, progreso, recompensas, speech, camara
src/content    contenido pedagogico (fuente de verdad)
src/config     XP, monedas, umbrales y limites
src/lib        utilidades (texto, aleatoriedad, almacenamiento, formato)
src/types      contratos compartidos
scripts/       validate-content.ts (seed.ts llega en la Fase 3)
src/server     db, repositorios, servicios, casos de uso (Fase 3)
docs/          documentacion y ADRs
tests/         unit, components (integration y e2e en fases siguientes)
```

## Estado del proyecto

Ver el checklist vivo en [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md).

- **Fase 0** (documentacion y arquitectura), **Fase 1** (fundacion) y **Fase 2**
  (contenido + rebanada vertical jugable) estan completadas.
- Hoy el progreso se guarda en el dispositivo (`localStorage`). MongoDB y la API
  `/api/v1` llegan en la Fase 3 sin cambiar la interfaz.
- Limitaciones conocidas al final de `docs/IMPLEMENTATION_PLAN.md`.

## Privacidad

Lee [`docs/PRIVACY.md`](./docs/PRIVACY.md). Resumen: solo se guarda el alias, el
avatar y el progreso de aprendizaje. Microfono y camara son opcionales, requieren
accion explicita y **nunca** se guardan grabaciones, fotos ni video.

## Despliegue

Instrucciones en `docs/DEPLOYMENT.md` (pendiente, Fase 6). **No desplegar sin
autorizacion explicita del propietario.**
