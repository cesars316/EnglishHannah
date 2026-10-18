import type { MetadataRoute } from "next";

import { SITE } from "@/config/game";

/**
 * Manifiesto PWA (Fase 7): permite instalar English Quest en el dispositivo.
 *
 * Next lo sirve en `/manifest.webmanifest` y anade el `<link rel="manifest">`
 * automaticamente. Los iconos son SVG con Pip (la mascota), asi que escalan a
 * cualquier tamano sin guardar binarios en el repositorio.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} - aprende ingles jugando`,
    short_name: SITE.name,
    description: SITE.description,
    lang: "es",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fffbf4",
    theme_color: "#fffbf4",
    icons: [
      { src: "/images/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      {
        src: "/images/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
