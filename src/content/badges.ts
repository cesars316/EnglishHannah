import type { Badge } from "@/types/content";

/** Insignias: una por mundo mas hitos transversales. */
export const BADGES: readonly Badge[] = [
  {
    id: "hello-star",
    kind: "world",
    title: { es: "Estrella del saludo", en: "Hello Star" },
    description: {
      es: "Terminaste Hello Village y ya sabes saludar y presentarte.",
      en: "You finished Hello Village and can greet and introduce yourself.",
    },
    emoji: "⭐",
    worldId: "hello-village",
  },
  {
    id: "color-crown",
    kind: "world",
    title: { es: "Corona de colores", en: "Color Crown" },
    description: {
      es: "Reconoces los colores en ingles cuando los escuchas y los lees.",
      en: "You recognise colours in English when you hear and read them.",
    },
    emoji: "🌈",
    worldId: "color-forest",
  },
  {
    id: "number-shell",
    kind: "world",
    title: { es: "Concha numerica", en: "Number Shell" },
    description: {
      es: "Cuentas y reconoces los numeros del 1 al 20 en ingles.",
      en: "You count and recognise numbers 1 to 20 in English.",
    },
    emoji: "🐚",
    worldId: "number-beach",
  },
  {
    id: "animal-friend",
    kind: "world",
    title: { es: "Amiga de los animales", en: "Animal Friend" },
    description: {
      es: "Nombras animales en ingles y hablas de los que te gustan.",
      en: "You name animals in English and talk about the ones you like.",
    },
    emoji: "🐾",
    worldId: "animal-park",
  },
  {
    id: "first-steps",
    kind: "milestone",
    title: { es: "Primeros pasos", en: "First Steps" },
    description: {
      es: "Completaste tu primera leccion en English Quest.",
      en: "You completed your first English Quest lesson.",
    },
    emoji: "👣",
    worldId: null,
  },
  {
    id: "brave-speaker",
    kind: "milestone",
    title: { es: "Voz valiente", en: "Brave Speaker" },
    description: {
      es: "Practicaste hablar en ingles en voz alta.",
      en: "You practised speaking English out loud.",
    },
    emoji: "🎤",
    worldId: null,
  },
  {
    id: "word-collector",
    kind: "milestone",
    title: { es: "Coleccionista de palabras", en: "Word Collector" },
    description: {
      es: "Practicaste 20 palabras distintas.",
      en: "You practised 20 different words.",
    },
    emoji: "📚",
    worldId: null,
  },
  {
    id: "island-explorer",
    kind: "milestone",
    title: { es: "Exploradora de la isla", en: "Island Explorer" },
    description: {
      es: "Terminaste los cuatro mundos del primer mapa.",
      en: "You finished all four worlds on the first map.",
    },
    emoji: "🏝️",
    worldId: null,
  },
] as const;

export const BADGES_BY_ID: Readonly<Record<string, Badge>> = Object.fromEntries(
  BADGES.map((badge) => [badge.id, badge]),
);
