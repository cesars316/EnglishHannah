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

| Herramienta | Version |
| --- | --- |
| Node.js | >= 20.9 (probado con 24.21.0) |
| npm | >= 10 (probado con 11.19.0) |
| Docker Desktop | opcional, para MongoDB local |

## Puesta en marcha (desde cero)

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de entorno y generar el secreto de sesion
cp .env.example .env.local
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
#   -> pega el resultado en AUTH_SECRET dentro de .env.local

# 3. Levantar MongoDB local (Docker)
npm run db:up

# 4. Crear indices y configuracion (idempotente)
npm run seed

# 5. Arrancar en desarrollo
npm run dev
#   -> http://localhost:3000
```

En Windows PowerShell el comando de copia es:

```powershell
Copy-Item .env.example .env.local
```

### Usar MongoDB Atlas en vez de Docker

1. Crea un cluster gratuito en MongoDB Atlas.
2. Copia la cadena de conexion y pegala en `MONGODB_URI` dentro de `.env.local`.
3. Ejecuta `npm run seed` y `npm run dev`.

No se necesitan mas cambios de codigo.

## Scripts

| Comando | Descripcion |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de produccion |
| `npm run start` | Servir el build |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint con autocorreccion |
| `npm run format` | Prettier |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run test` | Pruebas unitarias y de componentes (Vitest) |
| `npm run test:watch` | Vitest en modo watch |
| `npm run test:coverage` | Vitest con cobertura |
| `npm run test:integration` | Pruebas de integracion (requiere MongoDB) |
| `npm run test:e2e` | Playwright E2E |
| `npm run validate:content` | Valida el contenido pedagogico |
| `npm run seed` | Crea indices y configuracion en MongoDB (idempotente) |
| `npm run db:up` / `npm run db:down` | MongoDB local con Docker |

## Estructura

Ver [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md). Resumen:

```
src/app        rutas y pantallas (App Router)
src/components componentes de UI
src/features   dominio: actividades, progreso, recompensas, speech, camara
src/content    contenido pedagogico (fuente de verdad)
src/server     db, repositorios, servicios, casos de uso, auth, validacion
src/config     XP, monedas, umbrales y limites
docs/          documentacion y ADRs
tests/         unit, integration, e2e
```

## Estado del proyecto

Ver el checklist vivo en [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md).

## Privacidad

Lee [`docs/PRIVACY.md`](./docs/PRIVACY.md). Resumen: solo se guarda el alias, el
avatar y el progreso de aprendizaje. Microfono y camara son opcionales, requieren
accion explicita y **nunca** se guardan grabaciones, fotos ni video.

## Despliegue

Instrucciones en `docs/DEPLOYMENT.md` (pendiente, Fase 6). **No desplegar sin
autorizacion explicita del propietario.**
