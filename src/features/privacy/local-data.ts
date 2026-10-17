import { keysWithPrefix, readJson, removeKey } from "@/lib/storage";
import { notifyParentAuthChange } from "@/features/parent/local-passcode";
import { notifyProgressChange } from "@/features/progress/local-progress";
import { revalidateProfiles } from "@/features/profile/local-store";

/**
 * Gestion de los datos guardados en el dispositivo.
 *
 * Todo lo que la aplicacion escribe en `localStorage` usa el prefijo `eq.`, asi
 * que se puede exportar o borrar por completo sin tocar nada mas del navegador.
 * No hay copia en servidor salvo el modo con base de datos (Fase 3).
 */

const PREFIX = "eq.";

export type LocalDataExport = {
  exportedAt: string;
  appVersion: string;
  /** Claves guardadas y su contenido, tal cual. */
  data: Record<string, unknown>;
};

export function listLocalDataKeys(): string[] {
  return keysWithPrefix(PREFIX);
}

/** Instantanea descargable de todo lo guardado en este dispositivo. */
export function exportLocalData(): LocalDataExport {
  const data: Record<string, unknown> = {};
  for (const key of listLocalDataKeys()) {
    data[key] = readJson<unknown>(key, null);
  }
  return {
    exportedAt: new Date().toISOString(),
    appVersion: "1.0.0-local",
    data,
  };
}

/**
 * Borra definitivamente perfiles, progreso, intentos y el codigo de adultos.
 * Se usa desde la zona de padres, nunca desde la parte infantil.
 */
export function clearAllLocalData(): void {
  for (const key of listLocalDataKeys()) removeKey(key);
  revalidateProfiles();
  notifyProgressChange();
  notifyParentAuthChange();
}
