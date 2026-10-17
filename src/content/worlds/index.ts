import { CONTENT_VERSION } from "@/config/game";
import type { World } from "@/types/content";

/**
 * Ruta de mundos. El MVP entrega los cuatro primeros; el resto llega en Fase 7.
 * Cada mundo declara objetivos, prerrequisitos y su insignia.
 */
export const WORLDS: readonly World[] = [
  {
    id: "hello-village",
    title: { es: "Pueblo Hola", en: "Hello Village" },
    order: 1,
    description: {
      es: "Las palabras de saludo se perdieron. Ayuda a los vecinos a recuperarlas.",
      en: "The greeting words are lost. Help the villagers get them back.",
    },
    goal: {
      es: "Aprender a saludar, decir tu nombre y ser amable.",
      en: "Learn to greet, say your name and be polite.",
    },
    level: "pre-A1",
    prerequisites: [],
    lessonIds: ["hello-01", "hello-02", "hello-03"],
    badgeId: "hello-star",
    theme: { primary: "#c2410c", soft: "#ffe3d3", emoji: "🏡" },
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "color-forest",
    title: { es: "Bosque de Colores", en: "Color Forest" },
    order: 2,
    description: {
      es: "El bosque se quedo gris. Recupera los colores diciendo sus nombres.",
      en: "The forest turned grey. Bring the colours back by naming them.",
    },
    goal: {
      es: 'Reconocer colores, entender "What color is it?" y responder "It\'s red".',
      en: 'Recognise colours, understand "What color is it?" and answer "It\'s red".',
    },
    level: "pre-A1/A1",
    prerequisites: ["hello-village"],
    lessonIds: ["color-01", "color-02", "color-03"],
    badgeId: "color-crown",
    theme: { primary: "#6d4fbf", soft: "#efe9fb", emoji: "🌈" },
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "number-beach",
    title: { es: "Playa de Numeros", en: "Number Beach" },
    order: 3,
    description: {
      es: "Las conchas guardan numeros. Cuenta con Bloop para abrirlas.",
      en: "The shells hold numbers. Count with Bloop to open them.",
    },
    goal: {
      es: "Contar del 1 al 20, decir tu edad y hablar de cantidades.",
      en: "Count 1 to 20, say your age and talk about quantities.",
    },
    level: "A1",
    prerequisites: ["hello-village"],
    lessonIds: ["number-01", "number-02", "number-03"],
    badgeId: "number-shell",
    theme: { primary: "#0f5896", soft: "#dceefe", emoji: "🐚" },
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "animal-park",
    title: { es: "Parque de Animales", en: "Animal Park" },
    order: 4,
    description: {
      es: "Los animales perdieron sus nombres. Miralos bien y ayudalos.",
      en: "The animals lost their names. Look closely and help them.",
    },
    goal: {
      es: 'Nombrar animales, decir "It\'s a..." y expresar lo que te gusta.',
      en: 'Name animals, say "It\'s a..." and express what you like.',
    },
    level: "A1",
    prerequisites: ["color-forest"],
    lessonIds: ["animal-01", "animal-02", "animal-03", "animal-04"],
    badgeId: "animal-friend",
    theme: { primary: "#1c7149", soft: "#ecfaf3", emoji: "🐾" },
    contentVersion: CONTENT_VERSION,
    published: true,
  },
] as const;

export const WORLDS_BY_ID: Readonly<Record<string, World>> = Object.fromEntries(
  WORLDS.map((world) => [world.id, world]),
);

export const PUBLISHED_WORLDS: readonly World[] = [...WORLDS]
  .filter((world) => world.published)
  .sort((a, b) => a.order - b.order);
