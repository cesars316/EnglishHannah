"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Error de interfaz. Nunca muestra detalles tecnicos al niño ni promete que
 * algo se ha perdido: el progreso local sigue guardado.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Se registra en consola para depuracion local; no se envia a ningun sitio.
    console.error("Error de interfaz:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl items-center px-4 py-10">
      <EmptyState
        icon="shield"
        title="Algo no salio bien"
        description="No pasa nada: tu progreso sigue guardado. Puedes intentarlo otra vez o volver al inicio."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="primary" icon="refresh" onClick={reset}>
              Intentar de nuevo
            </Button>
            <Link
              href="/jugar"
              className="border-cream-300 text-cream-900 hover:border-brand-400 inline-flex min-h-12 items-center gap-2 rounded-2xl border-2 bg-white px-5 font-bold no-underline"
            >
              Volver al inicio
            </Link>
          </div>
        }
      />
    </div>
  );
}
