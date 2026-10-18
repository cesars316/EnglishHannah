import { CONTENT_VERSION } from "@/config/game";
import type { Lesson } from "@/types/content";

/** Lecciones del mundo 1: Hello Village. */
export const HELLO_VILLAGE_LESSONS: readonly Lesson[] = [
  {
    id: "hello-01",
    worldId: "hello-village",
    order: 1,
    title: { es: "¡Hola! ¿Como estas?", en: "Hello! How are you?" },
    intro: {
      es: "Pip llega al pueblo y nadie recuerda como saludar. ¡Empecemos por ahi!",
      en: "Pip arrives at the village and nobody remembers how to greet. Let's start there!",
    },
    objectives: [
      "Reconocer hello, hi y goodbye al escucharlos",
      "Leer las tres palabras de saludo",
      "Escribir la palabra hello",
    ],
    vocabularyIds: ["hello", "hi", "goodbye"],
    activityIds: ["hello-01-listen", "hello-01-choice", "hello-01-pairs", "hello-01-build"],
    estimatedMinutes: 7,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "hello-02",
    worldId: "hello-village",
    order: 2,
    title: { es: "Por favor y gracias", en: "Please and thank you" },
    intro: {
      es: "En el mercado, Mia te enseña las palabras magicas para pedir y agradecer.",
      en: "At the market, Mia teaches you the magic words to ask and thank.",
    },
    objectives: [
      "Usar please, thank you y sorry",
      "Comprender una frase de cortesia",
      "Relacionar cada palabra con su situacion",
    ],
    vocabularyIds: ["please", "thank-you", "sorry", "hello"],
    activityIds: ["hello-02-listen", "hello-02-choice", "hello-02-pairs", "hello-02-complete"],
    estimatedMinutes: 8,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "hello-03",
    worldId: "hello-village",
    order: 3,
    title: { es: "Mision final: ¿como te llamas?", en: "Final quest: what's your name?" },
    intro: {
      es: "El pueblo vuelve a saludar. Ayuda a Pip a presentarse ante sus amigos.",
      en: "The village greets again. Help Pip introduce himself to his friends.",
    },
    objectives: [
      "Responder yes y no",
      'Presentarte con "My name is..."',
      "Leer una mini-historia y responder preguntas",
      "Unir todo lo aprendido en Hello Village",
    ],
    vocabularyIds: ["yes", "no", "hello", "hi", "thank-you"],
    activityIds: [
      "hello-03-listen",
      "hello-03-complete",
      "hello-03-build",
      "hello-03-pairs",
      "hello-03-choice",
      "hello-03-story",
    ],
    estimatedMinutes: 10,
    isFinalMission: true,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
] as const;
