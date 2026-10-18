import { CONTENT_VERSION } from "@/config/game";
import type { Lesson } from "@/types/content";

/** Lecciones del mundo 7: My House. */
export const MY_HOUSE_LESSONS: readonly Lesson[] = [
  {
    id: "house-01",
    worldId: "my-house",
    order: 1,
    title: { es: "Las habitaciones", en: "The rooms" },
    intro: {
      es: "El mapa te lleva a una casa. Cada habitacion guarda una palabra nueva.",
      en: "The map takes you to a house. Every room hides a new word.",
    },
    objectives: [
      "Nombrar house, bedroom, kitchen y bathroom",
      'Localizar cosas con "It is in the..."',
      "Escribir la palabra kitchen",
    ],
    vocabularyIds: ["house", "bedroom", "kitchen", "bathroom"],
    activityIds: [
      "house-01-listen",
      "house-01-choice",
      "house-01-pairs",
      "house-01-complete",
      "house-01-build",
    ],
    estimatedMinutes: 9,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "house-02",
    worldId: "my-house",
    order: 2,
    title: { es: "Puertas, mesas y camas", en: "Doors, tables and beds" },
    intro: {
      es: "Ahora toca amueblar: puerta, ventana, mesa, silla y cama.",
      en: "Now it is time to furnish: door, window, table, chair and bed.",
    },
    objectives: [
      "Nombrar door, window, table, chair y bed",
      'Preguntar con "Where is...?"',
      'Responder con "It is on..."',
    ],
    vocabularyIds: ["door", "window", "table", "chair", "bed"],
    activityIds: [
      "house-02-listen",
      "house-02-choice",
      "house-02-pairs",
      "house-02-complete",
      "house-02-build",
    ],
    estimatedMinutes: 9,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "house-03",
    worldId: "my-house",
    order: 3,
    title: { es: "Mision final: encuentra todo", en: "Final quest: find everything" },
    intro: {
      es: "El salon esta casi listo. Coloca sofa y lampara y busca al gato escondido.",
      en: "The living room is almost ready. Place the sofa and the lamp and find the hiding cat.",
    },
    objectives: [
      "Nombrar living room, sofa y lamp",
      'Combinar "Where is...?" con "It is in/on..."',
      "Leer una mini-historia de la casa",
    ],
    vocabularyIds: ["living-room", "sofa", "lamp"],
    activityIds: [
      "house-03-listen",
      "house-03-choice",
      "house-03-pairs",
      "house-03-complete",
      "house-03-build",
      "house-03-story",
    ],
    estimatedMinutes: 10,
    isFinalMission: true,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
] as const;
