"use client";

import { useEffect } from "react";

/**
 * Aplica el ajuste de movimiento reducido guardado en el dispositivo
 * (a nivel de documento) incluso antes de que exista un perfil activo.
 * El ajuste por perfil lo aplica `ProfileProvider`.
 */
const STORAGE_KEY = "eq.reducedMotion";

export function MotionPreference() {
  useEffect(() => {
    const root = document.documentElement;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "true") root.dataset.motion = "reduced";

    const onStorage = (event: StorageEvent): void => {
      if (event.key !== STORAGE_KEY) return;
      if (event.newValue === "true") {
        root.dataset.motion = "reduced";
      } else {
        delete root.dataset.motion;
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}

export function persistReducedMotionPreference(reduced: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, reduced ? "true" : "false");
  } catch {
    /* almacenamiento no disponible */
  }
}
