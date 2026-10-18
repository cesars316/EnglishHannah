"use client";

import { useEffect } from "react";

/**
 * Registra el service worker de la PWA (Fase 7).
 *
 * - Solo en produccion: en desarrollo no se cachea nada y ademas se retira
 *   cualquier worker previo para que `next dev` sirva siempre codigo reciente.
 * - Sin service worker la aplicacion funciona igual; solo pierde el respaldo
 *   de recursos y la pagina sin conexion (ver `public/sw.js`).
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          for (const registration of registrations) void registration.unregister();
        })
        .catch(() => undefined);
      return;
    }

    void navigator.serviceWorker.register("/sw.js").catch(() => {
      // Sin respaldo offline seguimos funcionando; se reintenta en la proxima carga.
    });
  }, []);

  return null;
}
