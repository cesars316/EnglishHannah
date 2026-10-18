import { CONTENT_VERSION } from "@/config/game";
import type { Lesson } from "@/types/content";

/** Lecciones del mundo 5: Family Home. */
export const FAMILY_HOME_LESSONS: readonly Lesson[] = [
  {
    id: "family-01",
    worldId: "family-home",
    order: 1,
    title: { es: "Mama, papa y hermanos", en: "Mum, dad, sister and brother" },
    intro: {
      es: "La casa de la isla esta vacia. ¡Presenta a tu familia y llena la casa de voces!",
      en: "The house on the island is empty. Introduce your family and fill it with voices!",
    },
    objectives: [
      "Nombrar mum, dad, sister y brother",
      'Presentar a alguien con "This is my..."',
      "Escribir la palabra sister",
    ],
    vocabularyIds: ["mum", "dad", "sister", "brother"],
    activityIds: [
      "family-01-listen",
      "family-01-choice",
      "family-01-pairs",
      "family-01-complete",
      "family-01-build",
    ],
    estimatedMinutes: 8,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "family-02",
    worldId: "family-home",
    order: 2,
    title: { es: "Abuelos y bebe", en: "Grandma, grandpa and the baby" },
    intro: {
      es: "Tambien hay abuelos y un bebe en la casa. Aprendemos sus nombres.",
      en: "There are also grandparents and a baby in the house. Let's learn their names.",
    },
    objectives: [
      "Nombrar grandma, grandpa y baby",
      'Entender "She bakes cookies"',
      "Decir la palabra family",
    ],
    vocabularyIds: ["grandma", "grandpa", "baby", "family"],
    activityIds: [
      "family-02-listen",
      "family-02-choice",
      "family-02-pairs",
      "family-02-complete",
      "family-02-build",
    ],
    estimatedMinutes: 8,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "family-03",
    worldId: "family-home",
    order: 3,
    title: { es: "Mision final: la foto de familia", en: "Final quest: the family photo" },
    intro: {
      es: "¡Toda la familia esta lista! Compon la foto y cuenta quien es quien.",
      en: "The whole family is ready! Take the photo and say who is who.",
    },
    objectives: [
      'Decir "I love my family"',
      "Leer una mini-historia y responder preguntas",
      "Repasar toda la familia de la casa",
    ],
    vocabularyIds: ["love", "home", "family", "grandma"],
    activityIds: [
      "family-03-listen",
      "family-03-choice",
      "family-03-pairs",
      "family-03-complete",
      "family-03-build",
      "family-03-story",
    ],
    estimatedMinutes: 10,
    isFinalMission: true,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
] as const;
