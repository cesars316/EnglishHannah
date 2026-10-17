import type { ProfileSettings } from "@/types/domain";

/**
 * Ajustes por defecto de un perfil.
 *
 * Todo lo que requiere permiso del navegador empieza DESACTIVADO: microfono y
 * camara solo se activan si el adulto lo pide (documento maestro, seccion 4).
 */
export const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
  microphoneEnabled: false,
  cameraEnabled: false,
  soundEnabled: true,
  reducedMotion: false,
};
