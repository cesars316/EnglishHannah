# Guía de despliegue

> ⚠️ **Importante:** **No desplegar sin autorización explícita del propietario.** Este proyecto está en desarrollo y todas las fases se han validado en local.

Esta guía describe cómo desplegar la aplicación en entornos gratuitos, respetando los principios del proyecto: sin publicidad, sin rastreadores, solo MongoDB y sin almacenar audio/fotos/video.

## 1. Requisitos para despliegue

- **Node.js** >= 20.9 (recomendado 24.x)
- **MongoDB** accesible desde internet (MongoDB Atlas Free, o instancia con conexión segura)
- **AUTH_SECRET**: cadena aleatoria larga (>= 48 bytes) para firmar cookies httpOnly
- **Build** exitoso: `npm run verify` debe pasar en local

## 2. Variables de entorno

Crear `.env.local` (local) o configurar variables en el proveedor. Ver `.env.example`:

```env
MONGODB_URI=mongodb+srv://usuario:pass@cluster.mongodb.net/english_quest?retryWrites=true&w=majority
AUTH_SECRET=<<generar con node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))">>
NODE_ENV=production
```

Notas importantes:

- `AUTH_SECRET` es **obligatorio** en producción. Si falta, el servidor usa un secreto efímero por proceso y avisa por consola (las sesiones y desbloqueos de padres no sobreviven a reinicios).
- `MONGODB_URI` es obligatorio: la API devuelve `503 DB_UNAVAILABLE` si no hay conexión.
- No incluir credenciales en el repo. Nunca commitear `.env*.local`.

## 3. Opciones de despliegue (solo free tier)

### Opción A: Vercel + MongoDB Atlas (recomendado)

**Vercel (Free):**

1. Crear cuenta en [Vercel](https://vercel.com/)
2. Importar repositorio (GitHub/GitLab)
3. Framework: Next.js (detectado automáticamente)
4. Build: `npm run build`, Install: `npm ci`
5. Añadir variables de entorno: `MONGODB_URI`, `AUTH_SECRET`, `NODE_ENV=production`

**MongoDB Atlas (Free M0):**

1. Crear cluster M0 en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crear usuario con permisos de lectura/escritura en DB `english_quest`
3. Configurar Network Access: permitir IPs de Vercel (o `0.0.0.0/0` para free tier simple; revisar política de seguridad)
4. Obtener connection string (SRV) y añadir a `MONGODB_URI`
5. En primer despliegue, ejecutar `npm run seed` una vez (localmente contra la URI de producción, o desde un entorno de ejecución con acceso a BD). Es idempotente.

**Notas:** Vercel ejecuta funciones serverless. MongoDB Atlas M0 tiene límites (RAM/throughput). El proyecto usa driver nativo y operaciones sencillas (no requiere replica set para las operaciones actuales; el código está diseñado para entorno sin transacciones — ver ADRs).

### Opción B: Railway / Render (free tier disponible)

Ambos permiten desplegar Next.js con servidor Node (no solo serverless) y servicios MongoDB.

- Configurar variables de entorno igual que arriba
- Build: `npm run build`; Start: `npm run start`
- Ejecutar `npm run seed` tras primer despliegue para crear índices

### Opción C: Docker + VPS/host propio (free/self-host)

```bash
# Build imagen
docker build -t english-quest .

# Ejecutar con variables
docker run -p 3000:3000 \
  -e MONGODB_URI=$MONGODB_URI \
  -e AUTH_SECRET=$AUTH_SECRET \
  -e NODE_ENV=production \
  english-quest
```

Requiere MongoDB accesible. Usar `docker-compose.yml` solo para MongoDB local (`npm run db:up`).

## 4. Verificación previa al despliegue

Antes de cualquier despliegue (con autorización):

```bash
npm run verify
```

Esto ejecuta: `validate:content` + `lint` + `typecheck` + `test` + `build`. Todos deben pasar en verde.

## 5. Post-despliegue (smoke check)

1. Visitar `/api/v1/health` → debe responder JSON (`{"status":"ok","db":"ok"}` si BD conectada)
2. Visitar `/` → carga portada
3. Crear un perfil de prueba en `/empezar`
4. Jugar una actividad corta (hello-01 / color-01) → feedback y resumen funcionan
5. Zona `/padres`: configurar código la primera vez; desbloquear y ver panel
6. Privacidad `/privacidad` visible
7. Limpiar perfil de prueba desde `/padres` si es entorno de staging

Smoke rápido con PowerShell (ejemplo local/prod):

```powershell
$base = "https://tu-dominio.com"
Invoke-WebRequest -Uri "$base/api/v1/health" -Method GET | Select-Object StatusCode, Content
```

## 6. CI/CD

Existe pipeline en `.github/workflows/ci.yml`:

- Ejecuta en push a `main` y PRs
- Valida contenido, lint, tipos, tests unitarios/componentes y build
- Para integración E2E en CI, requiere MongoDB y navegadores; ver workflow ampliado en Fase 6 (documentado en `docs/IMPLEMENTATION_PLAN.md`)

## 7. Seguridad y buenas prácticas

- Usar HTTPS siempre en producción
- Cookies: `HttpOnly`, `SameSite=Lax`, `Secure` (automático en producción)
- Zona padres protegida con passcode hasheado con **scrypt** (nunca texto plano)
- No almacenar audio, fotos o video. Micrófono/cámara opcionales con fallback manual
- `ownerId` firmado con HMAC-SHA256; nunca se confía en cliente
- Cabeceras `X-Robots-Tag: noindex,nofollow,nocache` en rutas `/padres*` y `/perfiles*` (y política de indexación en privacidad)
- Revisar `npm audit` periódicamente (advisories dev-only conocidos, documentados)

## 8. Limitaciones conocidas

- MongoDB sin replica set: no se usan transacciones (diseño intencional). Ver ADR 0004.
- `mongo:8.0` en `docker-compose.yml` puede no descargarse en algunos entornos (CDN). En local se validó con MongoDB 7.0.
- Playwright browsers requieren descarga (pueden fallar en entornos con restricciones DNS/proxy). En CI se instalan según configuración.
- Secret efímero si falta `AUTH_SECRET` en producción → sesiones no persisten entre reinicios (advertencia en logs).

## 9. Rollback y limpieza

- No hay migraciones destructivas automáticas; `seed` es idempotente
- Borrado de datos: disponible desde Zona de Adultos (exportar JSON + borrar perfiles/completo)
- Rollback: redeploy versión anterior vía proveedor

**Recordatorio:** Este proyecto no debe publicarse sin aprobación explícita del propietario. Mantén entornos de staging separados y solicita validación antes de producción.
