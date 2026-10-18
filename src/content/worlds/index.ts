import { CONTENT_VERSION } from "@/config/game";
import type { World } from "@/types/content";

/**
 * Ruta de mundos. Los mundos 5-12 llegan con la expansion de contenido de la
 * Fase 7. Cada mundo declara objetivos, prerrequisitos y su insignia.
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
  {
    id: "family-home",
    title: { es: "Casa de la Familia", en: "Family Home" },
    order: 5,
    description: {
      es: "La casa esta vacia. Presenta a tu familia y llena de voces cada habitacion.",
      en: "The house is empty. Introduce your family and fill every room with voices.",
    },
    goal: {
      es: 'Nombrar a tu familia, decir "This is my..." y "I love my family".',
      en: 'Name your family, say "This is my..." and "I love my family".',
    },
    level: "A1",
    prerequisites: ["hello-village"],
    lessonIds: ["family-01", "family-02", "family-03"],
    badgeId: "family-heart",
    theme: { primary: "#b83280", soft: "#fce7f3", emoji: "🏠" },
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "food-market",
    title: { es: "Mercado de Comida", en: "Food Market" },
    order: 6,
    description: {
      es: "Los puestos del mercado estan mezclados. Ordena la fruta y la comida.",
      en: "The market stalls are mixed up. Put the fruit and the food in order.",
    },
    goal: {
      es: 'Nombrar comida, pedir con "Can I have...?" y decir "I like...".',
      en: 'Name food, ask with "Can I have...?" and say "I like...".',
    },
    level: "A1",
    prerequisites: ["family-home"],
    lessonIds: ["food-01", "food-02", "food-03"],
    badgeId: "market-basket",
    theme: { primary: "#b45309", soft: "#fef0dc", emoji: "🍎" },
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "my-house",
    title: { es: "Mi Casa", en: "My House" },
    order: 7,
    description: {
      es: "La casa esta desordenada. Coloca cada mueble en su habitacion.",
      en: "The house is a mess. Put every piece of furniture in its room.",
    },
    goal: {
      es: 'Nombrar habitaciones y muebles, y usar "Where is...?" con "It is in/on..."',
      en: 'Name rooms and furniture, and use "Where is...?" with "It is in/on..."',
    },
    level: "A1",
    prerequisites: ["family-home"],
    lessonIds: ["house-01", "house-02", "house-03"],
    badgeId: "house-key",
    theme: { primary: "#2f7d8f", soft: "#e4f4f7", emoji: "🏡" },
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "clothes-street",
    title: { es: "Calle Ropa", en: "Clothes Street" },
    order: 8,
    description: {
      es: "Los escaparates estan vacios. Viste cada tienda y prepara el desfile.",
      en: "The shop windows are empty. Dress every shop and get the parade ready.",
    },
    goal: {
      es: 'Nombrar tu ropa, decir sus colores y usar "I am wearing..."',
      en: 'Name your clothes, say their colours and use "I am wearing..."',
    },
    level: "A1",
    prerequisites: ["food-market"],
    lessonIds: ["clothes-01", "clothes-02", "clothes-03"],
    badgeId: "parade-star",
    theme: { primary: "#0f766e", soft: "#e2f6f3", emoji: "👕" },
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "feelings-garden",
    title: { es: "Jardin de los Sentimientos", en: "Feelings Garden" },
    order: 9,
    description: {
      es: "El jardin pierde color si nadie dice lo que siente. ¡Dilo en ingles!",
      en: "The garden loses colour if nobody says how they feel. Say it in English!",
    },
    goal: {
      es: 'Nombrar emociones y preguntar "How do you feel? I feel..."',
      en: 'Name emotions and ask "How do you feel? I feel..."',
    },
    level: "A1",
    prerequisites: ["my-house"],
    lessonIds: ["feel-01", "feel-02", "feel-03"],
    badgeId: "garden-heart",
    theme: { primary: "#a3478f", soft: "#fbeaf7", emoji: "🌸" },
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "weather-mountain",
    title: { es: "Montaña del Tiempo", en: "Weather Mountain" },
    order: 10,
    description: {
      es: "La montana cambia a cada hora. Cuenta el clima como una reportera.",
      en: "The mountain changes every hour. Report the weather like a broadcaster.",
    },
    goal: {
      es: 'Preguntar "What is the weather like?" y responder "It is sunny/hot/cold."',
      en: 'Ask "What is the weather like?" and answer "It is sunny/hot/cold."',
    },
    level: "A1",
    prerequisites: ["clothes-street"],
    lessonIds: ["weather-01", "weather-02", "weather-03"],
    badgeId: "weather-watch",
    theme: { primary: "#3b6fb6", soft: "#e8f0fb", emoji: "🏔️" },
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "school-hobbies",
    title: { es: "Escuela y Hobbies", en: "School & Hobbies" },
    order: 11,
    description: {
      es: "Suena el timbre: conoce el aula y ensena a tus amigos lo que sabes hacer.",
      en: "The bell rings: meet the classroom and show your friends what you can do.",
    },
    goal: {
      es: 'Nombrar objetos de clase y hobbies, y usar "I can..." con "I like to..."',
      en: 'Name classroom objects and hobbies, and use "I can..." with "I like to..."',
    },
    level: "A1",
    prerequisites: ["feelings-garden", "weather-mountain"],
    lessonIds: ["school-01", "school-02", "school-03"],
    badgeId: "skill-star",
    theme: { primary: "#c2410c", soft: "#fdeee5", emoji: "🎒" },
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "english-castle",
    title: { es: "Castillo Ingles", en: "English Castle" },
    order: 12,
    description: {
      es: "El gran final: recorre el castillo recuperando todo lo aprendido.",
      en: "The grand finale: tour the castle recalling everything you learned.",
    },
    goal: {
      es: "Repasar los doce mundos: presentarse, describir, preguntar y contar preferencias",
      en: "Review the twelve worlds: introduce yourself, describe, ask and tell preferences",
    },
    level: "A1",
    prerequisites: ["school-hobbies"],
    lessonIds: ["castle-01", "castle-02", "castle-03"],
    badgeId: "crown-keeper",
    theme: { primary: "#7c5cbf", soft: "#f1ecfb", emoji: "🏰" },
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
