/* English Quest - service worker (Fase 7: PWA / offline parcial).
 *
 * Politica de cache (docs/PRIVACY.md y ADR 0004):
 * - NUNCA se cachea nada de `/api/v1`: progreso, respuestas y zona parental
 *   viven solo en el servidor, que es la autoridad del juego.
 * - Solo se cachean recursos publicos: trozos estaticos de Next (hasheados),
 *   imagenes del contenido y la pagina de respaldo sin conexion.
 * - Navegaciones: siempre red. Sin conexion se responde con `/sin-conexion`
 *   precargada (o con el aviso minimo de respaldo) en vez del error del
 *   navegador. Las respuestas RSC y las peticiones de la aplicacion no se
 *   guardan, para no mezclar formatos en la misma cache.
 * - Se registra unicamente en produccion
 *   (src/components/layout/service-worker-registration.tsx).
 *
 * Sube CACHE_VERSION al desplegar un cambio que afecte a la pagina de
 * respaldo (docs/DEPLOYMENT.md).
 */
const CACHE_VERSION = "v1";
const CACHE_NAME = "english-quest-" + CACHE_VERSION;
const OFFLINE_URL = "/sin-conexion";

/* Aviso de respaldo por si la pagina /sin-conexion no se pudo precargar. */
const MINIMAL_OFFLINE_HTML =
  '<!doctype html><html lang="es"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width, initial-scale=1">' +
  "<title>Sin conexion - English Quest</title><style>" +
  "body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;" +
  'background:#fffbf4;color:#221b16;font-family:ui-rounded,"Segoe UI Rounded",system-ui,sans-serif}' +
  "main{max-width:34rem;padding:2rem;text-align:center}" +
  "h1{font-size:1.75rem;margin:0 0 0.75rem}" +
  "p{line-height:1.6;margin:0 0 1.5rem}" +
  "a{display:inline-block;background:#ea5a28;color:#ffffff;font-weight:700;" +
  "padding:0.75rem 1.5rem;border-radius:0.75rem;text-decoration:none}" +
  "</style></head><body><main><h1>Parece que no hay conexion</h1>" +
  "<p>Para jugar y guardar tu progreso hace falta internet. Tu avance no se " +
  "pierde: vuelve a conectarte y seguira donde lo dejaste.</p>" +
  '<p><a href="/">Volver al inicio</a></p></main></body></html>';

self.addEventListener("install", (event) => {
  event.waitUntil(precacheOfflinePage());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("english-quest-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  /* La autoridad del servidor: nunca se guarda ni se sirve de cache. */
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(navigateOrOffline(request));
    return;
  }

  /* Trozos de Next: URLs con hash, el contenido de una URL no cambia. */
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  /* Recursos publicos del contenido: red primero, cache como respaldo. */
  const destination = request.destination;
  if (destination === "image" || destination === "style" || destination === "font") {
    event.respondWith(networkThenCache(request));
  }

  /* El resto (RSC, manifiesto, favicon) solo pasa por la red. */
});

/* Precarga la pagina de respaldo y su hoja de estilos compartida. Si algo
   falla, la instalacion no se aborta: se usara el aviso minimo. */
async function precacheOfflinePage() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch(OFFLINE_URL);
    if (!response.ok) return;
    const html = await response.clone().text();
    await cache.put(OFFLINE_URL, response);

    const styles = Array.from(new Set(html.match(/\/_next\/static\/[^"' >]+\.css/g) ?? []));
    await Promise.allSettled(
      styles.map(async (assetUrl) => {
        const asset = await fetch(assetUrl);
        if (asset.ok) await cache.put(assetUrl, asset);
      }),
    );
  } catch {
    /* Sin precarga sigue funcionando el aviso minimo. */
  }
}

async function navigateOrOffline(request) {
  try {
    return await fetch(request);
  } catch {
    const cached = await caches.match(OFFLINE_URL, { ignoreSearch: true });
    if (cached) return cached;
    return new Response(MINIMAL_OFFLINE_HTML, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return Response.error();
  }
}

async function networkThenCache(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request, { ignoreVary: true });
    return cached ?? Response.error();
  }
}
