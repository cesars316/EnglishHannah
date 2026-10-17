import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";

/** Pagina 404 dentro de la aplicacion (sin cabecera de juego). */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl items-center px-4 py-10">
      <EmptyState
        icon="map"
        title="Esta parte del mapa no existe"
        description="Puede que el enlace haya cambiado. Vuelve al inicio y elige una mision desde el mapa."
        action={
          <Link
            href="/jugar/mapa"
            className="bg-brand-700 hover:bg-brand-800 inline-flex min-h-12 items-center gap-2 rounded-2xl px-5 font-bold text-white no-underline"
          >
            Ir al mapa de mundos
          </Link>
        }
      />
    </div>
  );
}
