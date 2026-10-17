"use client";

import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { StatusMessage } from "@/components/ui/status-message";
import { Spinner } from "@/components/ui/spinner";
import { LIMITS } from "@/config/game";
import { api } from "@/features/api/client";
import { validatePasscodeFormat } from "@/lib/passcode";
import type { ParentStatus } from "@/types/api";

/**
 * Puerta de la zona de adultos.
 *
 * - Si no hay codigo, se pide crearlo (nunca hay un PIN fijo en el codigo).
 * - Si lo hay, se pide una vez y se recuerda durante 30 minutos (cookie
 *   httpOnly firmada por el servidor; el navegador nunca ve el hash).
 * - Los intentos fallidos los limita el servidor: no se puede fuerza bruta.
 */
export function ParentGate({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<ParentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [passcode, setPasscode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    void api
      .get<ParentStatus>("/parent/status")
      .then((status) => setAuth(status))
      .catch(() => setAuth({ hasPasscode: false, unlocked: false }));
  }, []);

  if (auth === null) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner size={28} label="Cargando zona de adultos" />
      </div>
    );
  }

  if (auth.unlocked) {
    return (
      <div className="space-y-5">
        {children}
        <Button
          variant="secondary"
          icon="lock"
          onClick={async () => {
            try {
              await api.post("/parent/lock");
              setAuth({ ...auth, unlocked: false });
              setPasscode("");
              setAttempts(0);
            } catch {
              /* el servidor puede haberse ido; la siguiente peticion volvera a probar */
            }
          }}
        >
          Bloquear la zona de adultos
        </Button>
      </div>
    );
  }

  const createPasscode = async (): Promise<void> => {
    const format = validatePasscodeFormat(passcode);
    if (!format.ok) {
      setError(format.message ?? "Codigo no valido.");
      return;
    }
    if (passcode !== confirm) {
      setError("Los dos codigos no coinciden.");
      return;
    }

    setBusy(true);
    try {
      await api.post("/parent/setup", { passcode });
      setAuth({ hasPasscode: true, unlocked: true });
      setError(null);
      setPasscode("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar el codigo.");
    } finally {
      setBusy(false);
    }
  };

  const unlock = async (): Promise<void> => {
    if (attempts >= LIMITS.parentUnlockAttempts) {
      setError("Demasiados intentos. Espera unos minutos y vuelve a probar.");
      return;
    }

    setBusy(true);
    try {
      await api.post("/parent/unlock", { passcode });
      setAuth({ ...auth, unlocked: true });
      setError(null);
      setPasscode("");
      setAttempts(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ese codigo no es correcto.";
      setAttempts((previous) => previous + 1);
      setError(message);
      setPasscode("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md space-y-4">
      <div className="space-y-1">
        <h1 className="text-cream-900 flex items-center gap-2 text-xl font-extrabold">
          <Icon name="lock" size={22} />
          {auth.hasPasscode ? "Zona de adultos" : "Crea tu codigo de adulto"}
        </h1>
        <p className="text-cream-700 text-sm leading-relaxed">
          {auth.hasPasscode
            ? "Escribe el codigo para ver el progreso y los ajustes."
            : "Este codigo protege el progreso y los ajustes para que solo los adultos puedan cambiarlos. No lo compartas con los niños."}
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="passcode" className="text-cream-800 block text-sm font-bold">
          {auth.hasPasscode ? "Codigo" : "Nuevo codigo"}
        </label>
        <input
          id="passcode"
          type="password"
          inputMode="text"
          autoComplete="off"
          value={passcode}
          onChange={(event) => setPasscode(event.target.value)}
          className="border-cream-300 text-cream-900 min-h-12 w-full rounded-xl border-2 bg-white px-4 text-lg font-semibold tracking-widest outline-none focus:border-sky-500"
        />
        <p className="text-cream-600 text-xs">
          Entre 4 y 12 letras o numeros, sin espacios ni simbolos.
        </p>
      </div>

      {!auth.hasPasscode && (
        <div className="space-y-2">
          <label htmlFor="passcode-confirm" className="text-cream-800 block text-sm font-bold">
            Repite el codigo
          </label>
          <input
            id="passcode-confirm"
            type="password"
            autoComplete="off"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className="border-cream-300 text-cream-900 min-h-12 w-full rounded-xl border-2 bg-white px-4 text-lg font-semibold tracking-widest outline-none focus:border-sky-500"
          />
        </div>
      )}

      {error && (
        <StatusMessage tone="error" title="No se pudo continuar">
          <p>{error}</p>
        </StatusMessage>
      )}

      <Button
        variant="primary"
        size="lg"
        icon="lock"
        loading={busy}
        onClick={() => void (auth.hasPasscode ? unlock() : createPasscode())}
      >
        {auth.hasPasscode ? "Entrar" : "Crear codigo y entrar"}
      </Button>

      {busy && <Spinner size={20} label="Comprobando" />}
    </Card>
  );
}
