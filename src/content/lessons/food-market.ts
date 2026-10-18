import { CONTENT_VERSION } from "@/config/game";
import type { Lesson } from "@/types/content";

/** Lecciones del mundo 6: Food Market. */
export const FOOD_MARKET_LESSONS: readonly Lesson[] = [
  {
    id: "food-01",
    worldId: "food-market",
    order: 1,
    title: { es: "Frutas del mercado", en: "Fruit at the market" },
    intro: {
      es: "Mia vende fruta en el mercado. Aprende tres nombres para ayudarla a etiquetar.",
      en: "Mia sells fruit at the market. Learn three names to help her label it.",
    },
    objectives: [
      "Nombrar apple, banana y orange",
      "Escribir la palabra apple",
      "Relacionar cada fruta con su dibujo",
    ],
    vocabularyIds: ["apple", "banana", "orange-fruit"],
    activityIds: ["food-01-listen", "food-01-choice", "food-01-pairs", "food-01-build"],
    estimatedMinutes: 7,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "food-02",
    worldId: "food-market",
    order: 2,
    title: { es: "Pan, leche y queso", en: "Bread, milk and cheese" },
    intro: {
      es: "Ahora toca el puesto de desayuno: pan, leche, huevo, queso y agua.",
      en: "Now the breakfast stall: bread, milk, egg, cheese and water.",
    },
    objectives: [
      "Nombrar bread, milk, egg, cheese y water",
      'Pedir con cortesia: "Can I have...?"',
      "Escribir la palabra bread",
    ],
    vocabularyIds: ["bread", "milk", "egg", "cheese", "water"],
    activityIds: [
      "food-02-listen",
      "food-02-choice",
      "food-02-pairs",
      "food-02-complete",
      "food-02-build",
    ],
    estimatedMinutes: 9,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "food-03",
    worldId: "food-market",
    order: 3,
    title: { es: "Mision final: la cena", en: "Final quest: dinner" },
    intro: {
      es: "Casi es la hora de comer. Compra lo que falta y cocina con Mia.",
      en: "It is almost lunchtime. Buy what is missing and cook with Mia.",
    },
    objectives: [
      'Decir lo que te gusta con "I like..."',
      "Pedir comida con cortesia",
      "Leer una mini-historia del mercado",
    ],
    vocabularyIds: ["pizza", "rice", "water", "apple"],
    activityIds: [
      "food-03-listen",
      "food-03-choice",
      "food-03-pairs",
      "food-03-complete",
      "food-03-build",
      "food-03-story",
    ],
    estimatedMinutes: 10,
    isFinalMission: true,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
] as const;
