import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zona de adultos",
  robots: { index: false, follow: false, nocache: true },
};

/** Cascaron de la zona parental: sin navegacion infantil y con aviso claro. */
export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-cream-100 min-h-dvh">
      <header className="border-cream-300 bg-cream-50 border-b">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="text-cream-900 flex items-center gap-2 font-extrabold">
            <span aria-hidden="true">🔒</span>
            <span>Zona de adultos</span>
          </p>
          <Link
            href="/"
            className="text-cream-700 hover:bg-cream-100 flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold"
          >
            Volver al inicio
          </Link>
        </div>
      </header>
      <main id="contenido" className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
