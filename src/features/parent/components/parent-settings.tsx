"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { StatusMessage } from "@/components/ui/status-message";
import { api } from "@/features/api/client";
import { invalidateSummary } from "@/features/progress/remote-store";
import { useProfiles } from "@/features/profile/profile-context";
import { validatePasscodeFormat } from "@/lib/passcode";
import type { ExportBundle } from "@/types/api";

/**
 * Ajustes de la zona de adultos: cambiar el codigo, descargar o borrar los
 * datos del dispositivo.
 *
 * Ninguna accion se ejecuta sin una confirmacion explicita. El servidor es la
 * autoridad: el codigo viaja solo como valor temporal y nunca se guarda aqui.
 */

type PendingAction =
  | { kind: "clear-progress"; profileId: string; displayName: string }
  | { kind: "clear-everything" }
  | null;

export function ParentSettings() {
  const { profiles, deleteProfile } = useProfiles();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [codeMessage, setCodeMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState<PendingAction>(null);
  const [done, setDone] = useState<string | null>(null);

  const changePasscode = async (): Promise<void> => {
    const format = validatePasscodeFormat(next);
    if (!format.ok) {
      setCodeMessage({ ok: false, text: format.message });
      return;
    }
    if (next !== confirm) {
      setCodeMessage({ ok: false, text: "Los dos codigos nuevos no coinciden." });
      return;
    }

    try {
      await api.post("/parent/passcode", { currentPasscode: current, nextPasscode: next });
      setCurrent("");
      setNext("");
      setConfirm("");
      setCodeMessage({ ok: true, text: "Codigo actualizado." });
    } catch (err) {
      setCodeMessage({
        ok: false,
        text: err instanceof Error ? err.message : "No pudimos cambiar el codigo.",
      });
    }
  };

  const downloadData = useCallback(async () => {
    try {
      const entries: ExportBundle[] = [];
      for (const profile of profiles) {
        entries.push(await api.get<ExportBundle>(`/profiles/${profile.id}/export`));
      }
      const payload = JSON.stringify(
        { exportedAt: new Date().toISOString(), profiles: entries },
        null,
        2,
      );
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `english-quest-datos-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setDone("Se ha descargado una copia de los datos.");
    } catch {
      setDone(
        "No pudimos descargar los datos. Asegurate de que la zona de adultos esta desbloqueada.",
      );
    }
  }, [profiles]);

  const runPending = async (): Promise<void> => {
    if (!pending) return;

    try {
      if (pending.kind === "clear-progress") {
        await api.delete(`/profiles/${pending.profileId}/progress`);
        invalidateSummary(pending.profileId);
        setDone(`Se ha borrado el progreso de ${pending.displayName}.`);
      } else {
        for (const profile of profiles) {
          try {
            await deleteProfile(profile.id);
          } catch {
            /* si uno falla seguimos con el resto */
          }
        }
        setDone("Se han borrado todos los perfiles y su progreso.");
      }
    } catch {
      setDone(
        "No se pudo completar la operacion. Comprueba que la zona de adultos esta desbloqueada.",
      );
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-5">
      {done && (
        <StatusMessage tone="success" title="Listo">
          <p>{done}</p>
        </StatusMessage>
      )}

      <Card className="space-y-4">
        <h2 className="text-cream-900 text-lg font-extrabold">Cambiar el codigo de adulto</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor="passcode-current" className="text-cream-800 block text-sm font-bold">
              Codigo actual
            </label>
            <input
              id="passcode-current"
              type="password"
              autoComplete="off"
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
              className="border-cream-300 text-cream-900 min-h-11 w-full rounded-xl border-2 bg-white px-3 font-semibold tracking-widest outline-none focus:border-sky-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="passcode-next" className="text-cream-800 block text-sm font-bold">
              Codigo nuevo
            </label>
            <input
              id="passcode-next"
              type="password"
              autoComplete="off"
              value={next}
              onChange={(event) => setNext(event.target.value)}
              className="border-cream-300 text-cream-900 min-h-11 w-full rounded-xl border-2 bg-white px-3 font-semibold tracking-widest outline-none focus:border-sky-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="passcode-confirm" className="text-cream-800 block text-sm font-bold">
              Repite el nuevo
            </label>
            <input
              id="passcode-confirm"
              type="password"
              autoComplete="off"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="border-cream-300 text-cream-900 min-h-11 w-full rounded-xl border-2 bg-white px-3 font-semibold tracking-widest outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {codeMessage && (
          <StatusMessage
            tone={codeMessage.ok ? "success" : "error"}
            title={codeMessage.ok ? "Hecho" : "No se pudo cambiar"}
          >
            <p>{codeMessage.text}</p>
          </StatusMessage>
        )}

        <Button variant="primary" icon="check" onClick={() => void changePasscode()}>
          Guardar el codigo nuevo
        </Button>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-cream-900 text-lg font-extrabold">Tus datos</h2>
        <p className="text-cream-700 text-sm leading-relaxed">
          El progreso se guarda en el servidor local. Puedes descargar una copia o borrarlo por
          completo cuando quieras. No hay copias ocultas en ningun otro sitio.
        </p>
        <Button variant="secondary" icon="download" onClick={() => void downloadData()}>
          Descargar una copia
        </Button>
      </Card>

      <Card className="space-y-3" tone="muted">
        <h2 className="text-cream-900 text-lg font-extrabold">Borrar progreso</h2>
        <p className="text-cream-700 text-sm leading-relaxed">
          Borrar el progreso de un perfil no elimina el perfil. Para borrar el perfil entero, usa la
          opcion de al lado.
        </p>
        <ul className="space-y-2">
          {profiles.map((profile) => (
            <li
              key={profile.id}
              className="border-cream-200 flex flex-wrap items-center justify-between gap-2 rounded-2xl border bg-white p-3"
            >
              <span className="text-cream-900 font-bold">{profile.displayName}</span>
              <Button
                variant="danger"
                size="sm"
                icon="trash"
                onClick={() =>
                  setPending({
                    kind: "clear-progress",
                    profileId: profile.id,
                    displayName: profile.displayName,
                  })
                }
              >
                Borrar su progreso
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon="trash"
                onClick={async () => {
                  try {
                    await deleteProfile(profile.id);
                    setDone(`Se ha borrado el perfil ${profile.displayName}.`);
                  } catch {
                    setDone("No pudimos borrar el perfil. Necesita la zona de adultos desbloqueada.");
                  }
                }}
              >
                Borrar perfil
              </Button>
            </li>
          ))}
          {profiles.length === 0 && (
            <li className="text-cream-700 text-sm">Todavia no hay perfiles en este dispositivo.</li>
          )}
        </ul>

        <div className="border-cream-200 border-t pt-3">
          <Button
            variant="danger"
            icon="trash"
            onClick={() => setPending({ kind: "clear-everything" })}
          >
            Borrar todo (perfiles y progreso)
          </Button>
        </div>
      </Card>

      <Modal
        open={pending !== null}
        onClose={() => setPending(null)}
        title="Confirmar borrado"
        footer={
          <>
            <Button variant="danger" icon="trash" onClick={() => void runPending()}>
              Si, borrar
            </Button>
            <Button variant="secondary" onClick={() => setPending(null)}>
              Cancelar
            </Button>
          </>
        }
      >
        {pending?.kind === "clear-progress" ? (
          <p>
            Se borrara el progreso de <strong>{pending.displayName}</strong>: XP, monedas,
            insignias, intentos y palabras practicadas. El perfil seguira existiendo.
          </p>
        ) : (
          <p>
            Se borraran todos los perfiles y su progreso de este dispositivo. Esta accion no se
            puede deshacer.
          </p>
        )}
      </Modal>

      <p className="text-cream-700 text-sm">
        Consejo: si varios niños usan el mismo dispositivo, cada uno puede tener su propio perfil
        para no mezclar el progreso.
      </p>
    </div>
  );
}
