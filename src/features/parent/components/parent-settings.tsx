"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { StatusMessage } from "@/components/ui/status-message";
import { clearAllLocalData, exportLocalData } from "@/features/privacy/local-data";
import {
  setPasscode,
  validatePasscodeFormat,
  verifyPasscode,
} from "@/features/parent/local-passcode";
import { useProfiles } from "@/features/profile/profile-context";
import { clearProfileProgress } from "@/features/progress/local-progress";

/**
 * Ajustes de la zona de adultos: cambiar el codigo, descargar o borrar los
 * datos del dispositivo.
 *
 * Ninguna accion se ejecuta sin una confirmacion explicita.
 */

type PendingAction =
  | { kind: "clear-progress"; profileId: string; displayName: string }
  | { kind: "clear-everything" }
  | null;

export function ParentSettings() {
  const { profiles } = useProfiles();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [codeMessage, setCodeMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState<PendingAction>(null);
  const [done, setDone] = useState<string | null>(null);

  const changePasscode = async (): Promise<void> => {
    const format = validatePasscodeFormat(next);
    if (!format.ok) {
      setCodeMessage({ ok: false, text: format.message ?? "Codigo no valido." });
      return;
    }
    if (next !== confirm) {
      setCodeMessage({ ok: false, text: "Los dos codigos nuevos no coinciden." });
      return;
    }

    const isCurrentValid = await verifyPasscode(current);
    if (!isCurrentValid) {
      setCodeMessage({ ok: false, text: "El codigo actual no es correcto." });
      return;
    }

    await setPasscode(next);
    setCurrent("");
    setNext("");
    setConfirm("");
    setCodeMessage({ ok: true, text: "Codigo actualizado." });
  };

  const downloadData = (): void => {
    const payload = JSON.stringify(exportLocalData(), null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `english-quest-datos-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setDone("Se ha descargado una copia de los datos de este dispositivo.");
  };

  const runPending = (): void => {
    if (!pending) return;

    if (pending.kind === "clear-progress") {
      clearProfileProgress(pending.profileId);
      setDone(`Se ha borrado el progreso de ${pending.displayName}.`);
    } else {
      clearAllLocalData();
      setDone("Se han borrado todos los datos de este dispositivo.");
    }

    setPending(null);
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
          Todo se guarda en este dispositivo. Puedes descargar una copia o borrarlo por completo
          cuando quieras. No hay copias ocultas en ningun servidor.
        </p>
        <Button variant="secondary" icon="download" onClick={downloadData}>
          Descargar una copia
        </Button>
      </Card>

      <Card className="space-y-3" tone="muted">
        <h2 className="text-cream-900 text-lg font-extrabold">Borrar progreso</h2>
        <p className="text-cream-700 text-sm leading-relaxed">
          Borrar el progreso de un perfil no elimina el perfil. Para borrar el perfil entero, usa la
          pantalla de perfiles.
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
            <Button variant="danger" icon="trash" onClick={runPending}>
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
            Se borraran todos los perfiles, el progreso y el codigo de adulto de este dispositivo.
            Esta accion no se puede deshacer.
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
