import Link from "next/link";

import { Mascot } from "@/components/ui/mascot";
import { SITE } from "@/config/game";

/** Cascaron de las paginas publicas (sin navegacion de juego). */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-cream-200 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="text-cream-900 flex items-center gap-2 font-extrabold">
            <Mascot name="pip" size={36} />
            <span>{SITE.name}</span>
          </Link>
          <nav
            aria-label="Enlaces de la aplicacion"
            className="flex items-center gap-1 text-sm font-semibold"
          >
            <Link
              href="/privacidad"
              className="text-cream-700 hover:bg-cream-100 flex min-h-11 items-center rounded-xl px-3"
            >
              Privacidad
            </Link>
            <Link
              href="/padres"
              className="text-cream-700 hover:bg-cream-100 flex min-h-11 items-center gap-1.5 rounded-xl px-3"
            >
              <span aria-hidden="true">🔒</span>
              Adultos
            </Link>
          </nav>
        </div>
      </header>

      <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>

      <footer className="border-cream-200 border-t bg-white">
        <div className="text-cream-700 mx-auto w-full max-w-5xl px-4 py-6 text-sm sm:px-6">
          <p>
            {SITE.name} es un proyecto educativo. No hay publicidad, ni chat, ni rastreadores. No se
            guardan grabaciones de voz, fotos ni video.
          </p>
          <p className="mt-2">
            <Link
              href="/privacidad"
              className="font-semibold text-sky-700 underline underline-offset-2"
            >
              Como cuidamos los datos
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
