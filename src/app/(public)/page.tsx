import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { LinkButton } from "@/components/ui/link-button";
import { Mascot } from "@/components/ui/mascot";
import { ALL_VOCABULARY, PUBLISHED_WORLDS } from "@/content";
import { StartActions } from "@/features/profile/components/start-actions";
import { SITE } from "@/config/game";

export const metadata: Metadata = {
  title: "Aprende ingles jugando",
};

const HIGHLIGHTS = [
  {
    icon: "map" as const,
    title: "Una aventura por mundos",
    text: "Cada mundo enseña un grupo de palabras con misiones cortas de 10 a 15 minutos.",
  },
  {
    icon: "speaker" as const,
    title: "Escuchar, leer y hablar",
    text: "Actividades de escucha, lectura y construccion de frases, con apoyo en español.",
  },
  {
    icon: "shield" as const,
    title: "Sin publicidad ni rastreadores",
    text: "No hay chat, ni anuncios, ni datos de menores enviados a internet.",
  },
];

export default function LandingPage() {
  return (
    <div className="space-y-10">
      <section className="grid items-center gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="text-brand-700 text-xs font-bold tracking-wide uppercase">
            Ingles A1 para 9 años
          </p>
          <h1 className="text-cream-900 text-3xl leading-tight font-extrabold sm:text-4xl">
            ¡Bienvenida a {SITE.name}, tu aventura para aprender ingles!
          </h1>
          <p className="text-cream-700 max-w-xl text-base leading-relaxed">
            Explora mundos, escucha palabras, gana estrellas y monedas, y descubre insignias. Todo a
            tu ritmo: aqui no hay tiempo limite ni rachas que perder.
          </p>
          <StartActions />
          <p className="text-cream-600 text-sm">
            {PUBLISHED_WORLDS.length} mundos y {ALL_VOCABULARY.length} palabras listas para
            practicar.
          </p>
        </div>

        <div className="rounded-card border-cream-200 flex flex-wrap items-center justify-center gap-6 border bg-white p-6">
          <Mascot name="pip" mood="cheering" size={120} />
          <Mascot name="mia" mood="happy" size={104} />
          <Mascot name="bloop" mood="happy" size={88} />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {HIGHLIGHTS.map((highlight) => (
          <div
            key={highlight.title}
            className="rounded-card border-cream-200 space-y-2 border bg-white p-5"
          >
            <span
              aria-hidden="true"
              className="bg-brand-50 text-brand-700 flex size-11 items-center justify-center rounded-2xl"
            >
              <Icon name={highlight.icon} size={22} />
            </span>
            <h2 className="text-cream-900 font-extrabold">{highlight.title}</h2>
            <p className="text-cream-700 text-sm leading-relaxed">{highlight.text}</p>
          </div>
        ))}
      </section>

      <section className="rounded-card flex flex-wrap items-center justify-between gap-4 border border-sky-100 bg-sky-50 p-6">
        <div className="space-y-1">
          <h2 className="text-cream-900 text-lg font-extrabold">¿Eres madre, padre o tutor?</h2>
          <p className="text-cream-700 max-w-xl text-sm leading-relaxed">
            En la zona de adultos puedes ver el progreso, ajustar el sonido, el microfono y la
            camara, y descargar o borrar los datos del dispositivo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton href="/padres" variant="secondary" icon="shield">
            Zona de adultos
          </LinkButton>
          <Link
            href="/privacidad"
            className="flex min-h-12 items-center gap-2 rounded-2xl px-5 font-bold text-sky-800 underline underline-offset-2"
          >
            Privacidad
          </Link>
        </div>
      </section>
    </div>
  );
}
