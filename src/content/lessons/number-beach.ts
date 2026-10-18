import { CONTENT_VERSION } from "@/config/game";
import type { Lesson } from "@/types/content";

/** Lecciones del mundo 3: Number Beach. */
export const NUMBER_BEACH_LESSONS: readonly Lesson[] = [
  {
    id: "number-01",
    worldId: "number-beach",
    order: 1,
    title: { es: "Del uno al cinco", en: "One to five" },
    intro: {
      es: "Bloop guarda numeros dentro de las conchas. Cuenta para abrirlas.",
      en: "Bloop keeps numbers inside the shells. Count to open them.",
    },
    objectives: [
      "Escuchar y reconocer los numeros 1 a 5",
      "Contar objetos",
      "Leer los numeros escritos",
    ],
    vocabularyIds: ["one", "two", "three", "four", "five"],
    activityIds: ["number-01-listen", "number-01-choice", "number-01-pairs", "number-01-complete"],
    estimatedMinutes: 8,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "number-02",
    worldId: "number-beach",
    order: 2,
    title: { es: "Del seis al diez", en: "Six to ten" },
    intro: {
      es: "¡Ya cuentas hasta cinco! Sigamos con las dos manos completas.",
      en: "You can count to five! Let's continue with two whole hands.",
    },
    objectives: [
      "Reconocer los numeros 6 a 10",
      "Contar grupos grandes",
      "Escribir la palabra eight",
    ],
    vocabularyIds: ["six", "seven", "eight", "nine", "ten"],
    activityIds: ["number-02-listen", "number-02-choice", "number-02-pairs", "number-02-build"],
    estimatedMinutes: 8,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "number-03",
    worldId: "number-beach",
    order: 3,
    title: { es: "Mision final: hasta el veinte", en: "Final quest: up to twenty" },
    intro: {
      es: "Las conchas grandes guardan los numeros del once al veinte. ¡Vamos alla!",
      en: "The big shells keep numbers eleven to twenty. Let's go!",
    },
    objectives: [
      "Reconocer los numeros 11 a 20",
      'Decir tu edad con "I\'m nine"',
      "Leer una mini-historia y responder preguntas",
      "Repasar los numeros de la playa",
    ],
    vocabularyIds: ["eleven", "twelve", "fifteen", "twenty", "thirteen", "nine"],
    activityIds: [
      "number-03-listen",
      "number-03-choice",
      "number-03-pairs",
      "number-03-build",
      "number-03-complete",
      "number-03-story",
    ],
    estimatedMinutes: 10,
    isFinalMission: true,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
] as const;
