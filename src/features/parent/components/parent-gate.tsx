"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { StatusMessage } from "@/components/ui/status-message";
import { Spinner } from "@/components/ui/spinner";
import { LIMITS } from "@/config/game";
import {
  getParentAuthSnapshot,
  grantParentUnlock,
  revokeParentUnlock,
  SERVER_PARENT_AUTH,
  setPasscode,
  subscribeParentAuth,
  validatePasscodeFormat,
  verifyPasscode,
} from "@/features/parent/local-passcode";

/**
 * Puerta de la zona de adultos.
 *
 * - Si no hay codigo, se pide crearlo (nunca hay un PIN fijo en el codigo).
 * - Si lo hay, se pide una vez y se recuerda durante 30 minutos.
 * - Sin WebCrypto (navegadores muy antiguos) se explica el motivo.
 */
export function ParentGate({ children }: { children: ReactNode }) {
  const auth = useSyncExternalStore(
    subscribeParentAuth,
    getParentAuthSnapshot,
    () => SERVER_PARENT_AUTH,
  );

  const [passcode, setPasscodeValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [attempts, setAttempts] = useState(0);

  if (!auth.supported) {
    return (
      <StatusMessage tone="warning" title="Este navegador no puede proteger la zona de adultos">
        <p>
          Falta el soporte de cifrado del navegador (WebCrypto), necesario para guardar el codigo
          sin exponerlo. Prueba con una version reciente de Chrome, Edge, Firefox o Safari.
        </p>
      </StatusMessage>
    );
  }

  if (auth.unlocked) {
    return (
      <div className="space-y-5">
        {children}
        <Button
          variant="secondary"
          icon="lock"
          onClick={() => {
            revokeParentUnlock();
            setPasscodeValue("");
            setAttempts(0);
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
      await setPasscode(passcode);
      grantParentUnlock();
      setError(null);
      setPasscodeValue("");
      setConfirm("");
    } catch {
      setError("No pudimos guardar el codigo. Intentalo otra vez.");
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
      const ok = await verifyPasscode(passcode);
      if (ok) {
        grantParentUnlock();
        setError(null);
        setPasscodeValue("");
        setAttempts(0);
      } else {
        setAttempts((previous) => previous + 1);
        setError("Ese codigo no es correcto.");
        setPasscodeValue("");
      }
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
          onChange={(event) => setPasscodeValue(event.target.value)}
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
