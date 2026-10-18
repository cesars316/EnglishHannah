import { CONTENT_VERSION } from "@/config/game";
import type { Lesson } from "@/types/content";

/** Lecciones del mundo 9: Feelings Garden. */
export const FEELINGS_GARDEN_LESSONS: readonly Lesson[] = [
  {
    id: "feel-01",
    worldId: "feelings-garden",
    order: 1,
    title: { es: "Feliz y triste", en: "Happy and sad" },
    intro: {
      es: "El jardin pierde sus colores cuando nadie nombra lo que siente. ¡Empecemos!",
      en: "The garden loses its colour when nobody names what they feel. Let's start!",
    },
    objectives: [
      "Nombrar happy y sad",
      'Preguntar y responder con "How do you feel? I feel..."',
      "Escribir la palabra happy",
    ],
    vocabularyIds: ["happy", "sad", "cry", "smile"],
    activityIds: [
      "feel-01-listen",
      "feel-01-choice",
      "feel-01-pairs",
      "feel-01-complete",
      "feel-01-build",
    ],
    estimatedMinutes: 8,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "feel-02",
    worldId: "feelings-garden",
    order: 2,
    title: { es: "Enfadado, cansado y asustado", en: "Angry, tired and scared" },
    intro: {
      es: "A veces el jardin da miedo de noche. Nombra esas emociones para calmarlo.",
      en: "Sometimes the garden is scary at night. Name those feelings to calm it down.",
    },
    objectives: [
      "Nombrar angry, tired y scared",
      'Decir de que tienes miedo con "I am scared of..."',
      "Escribir la palabra angry",
    ],
    vocabularyIds: ["angry", "tired", "scared", "feel"],
    activityIds: [
      "feel-02-listen",
      "feel-02-choice",
      "feel-02-pairs",
      "feel-02-complete",
      "feel-02-build",
    ],
    estimatedMinutes: 8,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "feel-03",
    worldId: "feelings-garden",
    order: 3,
    title: { es: "Mision final: cuida el jardin", en: "Final quest: care for the garden" },
    intro: {
      es: "Come fruta, bebe agua y cuenta todos los sentimientos del jardin.",
      en: "Eat some fruit, drink some water and name every feeling in the garden.",
    },
    objectives: [
      "Nombrar hungry, thirsty y feelings",
      'Responder "Are you OK?" con "Yes, I am."',
      "Leer una mini-historia del jardin",
    ],
    vocabularyIds: ["hungry", "thirsty", "feelings"],
    activityIds: [
      "feel-03-listen",
      "feel-03-choice",
      "feel-03-pairs",
      "feel-03-complete",
      "feel-03-build",
      "feel-03-story",
    ],
    estimatedMinutes: 10,
    isFinalMission: true,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
] as const;
