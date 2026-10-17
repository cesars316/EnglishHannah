import { CONTENT_VERSION } from "@/config/game";
import type { Lesson } from "@/types/content";

/** Lecciones del mundo 4: Animal Park. */
export const ANIMAL_PARK_LESSONS: readonly Lesson[] = [
  {
    id: "animal-01",
    worldId: "animal-park",
    order: 1,
    title: { es: "Amigos del parque", en: "Park friends" },
    intro: {
      es: "Los animales del parque perdieron sus nombres. ¡Ayudalos a encontrarlos!",
      en: "The park animals lost their names. Help them find them again!",
    },
    objectives: [
      "Nombrar dog, cat, bird y fish",
      "Escuchar y elegir el animal correcto",
      "Escribir la palabra dog",
    ],
    vocabularyIds: ["dog", "cat", "bird", "fish"],
    activityIds: ["animal-01-listen", "animal-01-choice", "animal-01-pairs", "animal-01-build"],
    estimatedMinutes: 8,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "animal-02",
    worldId: "animal-park",
    order: 2,
    title: { es: "En la granja", en: "On the farm" },
    intro: {
      es: "Cerca del parque hay una granja. Mia te presenta a sus habitantes.",
      en: "Near the park there is a farm. Mia introduces you to its residents.",
    },
    objectives: [
      "Nombrar rabbit, horse, cow y duck",
      'Entender "The cow says moo"',
      "Relacionar palabra y animal",
    ],
    vocabularyIds: ["rabbit", "horse", "cow", "duck"],
    activityIds: ["animal-02-listen", "animal-02-choice", "animal-02-pairs", "animal-02-complete"],
    estimatedMinutes: 8,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "animal-03",
    worldId: "animal-park",
    order: 3,
    title: { es: "Animales salvajes", en: "Wild animals" },
    intro: {
      es: "Al final del parque vive el leon y, escondido, un mono muy jugueton.",
      en: "At the end of the park lives the lion and, hidden, a very playful monkey.",
    },
    objectives: [
      "Nombrar lion y monkey",
      'Decir "It\'s a lion" y "I like monkeys"',
      "Repasar los animales aprendidos",
    ],
    vocabularyIds: ["lion", "monkey", "bird", "fish"],
    activityIds: ["animal-03-listen", "animal-03-choice", "animal-03-pairs", "animal-03-complete"],
    estimatedMinutes: 8,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "animal-04",
    worldId: "animal-park",
    order: 4,
    title: { es: "Mision final: el desfile de animales", en: "Final quest: the animal parade" },
    intro: {
      es: "Todos los animales ya tienen su nombre. ¡Acompáñalos en el desfile!",
      en: "All the animals have their names back. Join them in the parade!",
    },
    objectives: [
      "Escuchar, leer y escribir animales",
      'Decir lo que te gusta con "I like..."',
      "Completar el mundo Animal Park",
    ],
    vocabularyIds: ["dog", "cat", "horse", "duck", "lion", "monkey"],
    activityIds: [
      "animal-04-listen",
      "animal-04-choice",
      "animal-04-pairs",
      "animal-04-build",
      "animal-04-complete",
    ],
    estimatedMinutes: 11,
    isFinalMission: true,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
] as const;
