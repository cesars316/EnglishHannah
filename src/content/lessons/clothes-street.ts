import { CONTENT_VERSION } from "@/config/game";
import type { Lesson } from "@/types/content";

/** Lecciones del mundo 8: Clothes Street. */
export const CLOTHES_STREET_LESSONS: readonly Lesson[] = [
  {
    id: "clothes-01",
    worldId: "clothes-street",
    order: 1,
    title: { es: "Camisas y pantalones", en: "Shirts and pants" },
    intro: {
      es: "Los escaparates estan vacios. Viste las tiendas con las primeras prendas.",
      en: "The shop windows are empty. Dress the shops with the first clothes.",
    },
    objectives: [
      "Nombrar shirt, t-shirt y pants",
      'Decir el color de tu ropa con "My ... is blue"',
      "Escribir la palabra shirt",
    ],
    vocabularyIds: ["shirt", "tshirt", "pants"],
    activityIds: ["clothes-01-listen", "clothes-01-choice", "clothes-01-pairs", "clothes-01-build"],
    estimatedMinutes: 7,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "clothes-02",
    worldId: "clothes-street",
    order: 2,
    title: { es: "Vestidos y zapatos", en: "Dresses and shoes" },
    intro: {
      es: "Sigue la calle: vestidos, calcetines y zapatos de todos los colores.",
      en: "Keep walking down the street: dresses, socks and shoes in every colour.",
    },
    objectives: [
      "Nombrar dress, socks y shoes",
      "Recordar colores al hablar de ropa",
      "Escribir la palabra shoes",
    ],
    vocabularyIds: ["dress", "socks", "shoes"],
    activityIds: [
      "clothes-02-listen",
      "clothes-02-choice",
      "clothes-02-pairs",
      "clothes-02-complete",
      "clothes-02-build",
    ],
    estimatedMinutes: 9,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "clothes-03",
    worldId: "clothes-street",
    order: 3,
    title: { es: "Mision final: el desfile de ropa", en: "Final quest: the fashion parade" },
    intro: {
      es: "Habran el desfile cuando vean la ropa completa. Ponte gorro y chaqueta.",
      en: "The parade starts when the full outfit is ready. Put on your hat and jacket.",
    },
    objectives: [
      "Nombrar hat, jacket y clothes",
      'Decir lo que llevas con "I am wearing..."',
      "Leer una mini-historia del desfile",
    ],
    vocabularyIds: ["hat", "jacket", "clothes", "wear"],
    activityIds: [
      "clothes-03-listen",
      "clothes-03-choice",
      "clothes-03-pairs",
      "clothes-03-complete",
      "clothes-03-build",
      "clothes-03-story",
    ],
    estimatedMinutes: 10,
    isFinalMission: true,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
] as const;
