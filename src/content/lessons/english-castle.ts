import { CONTENT_VERSION } from "@/config/game";
import type { Lesson } from "@/types/content";

/** Lecciones del mundo 12: English Castle (repaso integrado + palabras del castillo). */
export const ENGLISH_CASTLE_LESSONS: readonly Lesson[] = [
  {
    id: "castle-01",
    worldId: "english-castle",
    order: 1,
    title: { es: "Bienvenido al castillo", en: "Welcome to the castle" },
    intro: {
      es: "El porton se abre. Aprende las palabras del castillo para entrar.",
      en: "The gate opens. Learn the castle words to get inside.",
    },
    objectives: [
      "Nombrar castle, gate, flag y knight",
      'Dar la bienvenida con "Welcome to..."',
      "Escribir la palabra castle",
    ],
    vocabularyIds: ["castle", "gate", "flag", "knight"],
    activityIds: [
      "castle-01-listen",
      "castle-01-choice",
      "castle-01-pairs",
      "castle-01-complete",
      "castle-01-build",
    ],
    estimatedMinutes: 8,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "castle-02",
    worldId: "english-castle",
    order: 2,
    title: { es: "Dragon, coraje y magia", en: "Dragon, courage and magic" },
    intro: {
      en: "A friendly dragon waits inside. Name your feelings and be brave.",
      es: "Un dragon amigable espera dentro. Nombra tus sentimientos y se valiente.",
    },
    objectives: [
      "Nombrar dragon, magic y brave",
      'Decir como te sientes con "I feel..."',
      "Escribir la palabra brave",
    ],
    vocabularyIds: ["dragon", "magic", "brave", "happy", "tired"],
    activityIds: [
      "castle-02-listen",
      "castle-02-choice",
      "castle-02-pairs",
      "castle-02-complete",
      "castle-02-build",
    ],
    estimatedMinutes: 9,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "castle-03",
    worldId: "english-castle",
    order: 3,
    title: { es: "Mision final: la gran prueba", en: "Final quest: the great test" },
    intro: {
      es: "La corona esta al final del pasillo. Recuerda todo lo aprendido para conseguirla.",
      en: "The crown is at the end of the corridor. Remember everything you learned to get it.",
    },
    objectives: [
      "Nombrar crown",
      "Recuperar palabras de los doce mundos",
      "Leer la mini-historia final de la aventura",
    ],
    vocabularyIds: ["crown", "apple", "house", "sun"],
    activityIds: [
      "castle-03-listen",
      "castle-03-choice",
      "castle-03-pairs",
      "castle-03-complete",
      "castle-03-build",
      "castle-03-story",
    ],
    estimatedMinutes: 10,
    isFinalMission: true,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
] as const;
