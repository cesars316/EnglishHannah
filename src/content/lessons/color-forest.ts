import { CONTENT_VERSION } from "@/config/game";
import type { Lesson } from "@/types/content";

/** Lecciones del mundo 2: Color Forest. */
export const COLOR_FOREST_LESSONS: readonly Lesson[] = [
  {
    id: "color-01",
    worldId: "color-forest",
    order: 1,
    title: { es: "Rojo, azul y amarillo", en: "Red, blue and yellow" },
    intro: {
      es: "El bosque esta gris. Con tus primeras tres palabras, parte del color vuelve.",
      en: "The forest is grey. With your first three words, some colour comes back.",
    },
    objectives: [
      "Reconocer red, blue y yellow al escucharlos",
      "Leer las tres palabras",
      'Completar la frase "The banana is yellow"',
    ],
    vocabularyIds: ["red", "blue", "yellow"],
    activityIds: ["color-01-listen", "color-01-choice", "color-01-pairs", "color-01-complete"],
    estimatedMinutes: 7,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "color-02",
    worldId: "color-forest",
    order: 2,
    title: { es: "Verde, naranja, morado y rosa", en: "Green, orange, purple and pink" },
    intro: {
      es: "Ahora toca aprender los colores de las hojas, las flores y las frutas.",
      en: "Now let's learn the colours of leaves, flowers and fruit.",
    },
    objectives: [
      "Escuchar y reconocer cuatro colores nuevos",
      "Relacionar palabra y color",
      "Escribir la palabra green",
    ],
    vocabularyIds: ["green", "orange", "purple", "pink"],
    activityIds: ["color-02-listen", "color-02-choice", "color-02-pairs", "color-02-build"],
    estimatedMinutes: 8,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "color-03",
    worldId: "color-forest",
    order: 3,
    title: { es: "Mision final: todo el arcoiris", en: "Final quest: the whole rainbow" },
    intro: {
      es: "¡Ya casi esta! Completa el arcoiris y el bosque brillara otra vez.",
      en: "Almost there! Complete the rainbow and the forest will shine again.",
    },
    objectives: [
      "Reconocer black, white y brown",
      'Responder "What color is it?"',
      "Repasar todos los colores del bosque",
    ],
    vocabularyIds: ["black", "white", "brown", "green", "yellow"],
    activityIds: [
      "color-03-listen",
      "color-03-choice",
      "color-03-pairs",
      "color-03-build",
      "color-03-complete",
    ],
    estimatedMinutes: 10,
    isFinalMission: true,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
] as const;
