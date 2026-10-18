import { CONTENT_VERSION } from "@/config/game";
import type { Lesson } from "@/types/content";

/** Lecciones del mundo 11: School & Hobbies. */
export const SCHOOL_HOBBIES_LESSONS: readonly Lesson[] = [
  {
    id: "school-01",
    worldId: "school-hobbies",
    order: 1,
    title: { es: "En el aula", en: "In the classroom" },
    intro: {
      es: "Suena el timbre. Conoce el aula: libro, lapiz, maestra y amiga.",
      en: "The bell rings. Meet the classroom: book, pencil, teacher and friend.",
    },
    objectives: [
      "Nombrar book, pencil, teacher y friend",
      'Presentar lo tuyo con "This is my..."',
      "Escribir la palabra pencil",
    ],
    vocabularyIds: ["book", "pencil", "teacher", "friend"],
    activityIds: [
      "school-01-listen",
      "school-01-choice",
      "school-01-pairs",
      "school-01-complete",
      "school-01-build",
    ],
    estimatedMinutes: 8,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "school-02",
    worldId: "school-hobbies",
    order: 2,
    title: { es: "Mis hobbies", en: "My hobbies" },
    intro: {
      es: "Despues de clase llega el tiempo libre. ¿Que te gusta hacer?",
      en: "After class comes free time. What do you like to do?",
    },
    objectives: [
      "Nombrar read, draw, dance y sing",
      'Decir tus gustos con "I like to..."',
      "Escribir la palabra dance",
    ],
    vocabularyIds: ["read", "draw", "dance", "sing"],
    activityIds: [
      "school-02-listen",
      "school-02-choice",
      "school-02-pairs",
      "school-02-complete",
      "school-02-build",
    ],
    estimatedMinutes: 9,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "school-03",
    worldId: "school-hobbies",
    order: 3,
    title: { es: "Mision final: la feria de hobbies", en: "Final quest: the hobbies fair" },
    intro: {
      es: "En la feria cada nino enseña lo que sabe hacer. Di lo que puedes y lo que juegas.",
      en: "At the fair every child shows what they can do. Say what you can do and what you play.",
    },
    objectives: [
      "Nombrar swim y play",
      'Hablar de habilidades con "I can..."',
      "Leer una mini-historia de la feria",
    ],
    vocabularyIds: ["swim", "play"],
    activityIds: [
      "school-03-listen",
      "school-03-choice",
      "school-03-pairs",
      "school-03-complete",
      "school-03-build",
      "school-03-story",
    ],
    estimatedMinutes: 10,
    isFinalMission: true,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
] as const;
