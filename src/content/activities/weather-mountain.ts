import {
  buildImageChoice,
  buildListenAndChoose,
  buildMatchingPairs,
  buildSentenceCompletion,
  buildStoryQuiz,
  buildWordBuilder,
  imageVisual,
} from "@/content/helpers";
import type { Activity, ChoiceOption, MatchingPair, VocabularyVisual } from "@/types/content";

const SUN = imageVisual("sun", "Un sol amarillo con rayos");
const RAIN = imageVisual("rain", "Una nube con gotas de lluvia");
const CLOUD = imageVisual("cloud", "Una nube blanca");
const WIND = imageVisual("wind", "Tres lineas de viento");
const SNOW = imageVisual("snow", "Un copo de nieve azul");
const STORM = imageVisual("storm", "Una nube oscura con un rayo");
const HOT = imageVisual("hot", "Un termometro alto con ondas de calor");
const COLD = imageVisual("cold", "Un termometro bajo con un copo de nieve");
const WEATHER = imageVisual("weather", "Sol y nube juntos");
const SUNNY = imageVisual("sunny", "Un sol sobre colinas verdes");

const option = (id: string, visual: VocabularyVisual): ChoiceOption => ({ id, visual });
const word = (id: string, label: string): ChoiceOption => ({ id, label });

const pairOf = (id: string, label: string, visual: VocabularyVisual): MatchingPair => ({
  id,
  left: { id, label },
  right: { id, visual },
});

/** Mundo 10: Weather Mountain. */
export const WEATHER_MOUNTAIN_ACTIVITIES: readonly Activity[] = [
  buildListenAndChoose({
    id: "weather-01-listen",
    worldId: "weather-mountain",
    lessonId: "weather-01",
    order: 1,
    vocabularyIds: ["sun", "rain", "cloud"],
    say: "sun",
    options: [option("sun", SUN), option("rain", RAIN), option("cloud", CLOUD)],
    answerId: "sun",
    hints: [
      {
        es: "Es amarillo y da luz en el cielo.",
        en: "It is yellow and gives light in the sky.",
      },
    ],
  }),
  buildImageChoice({
    id: "weather-01-choice",
    worldId: "weather-mountain",
    lessonId: "weather-01",
    order: 2,
    vocabularyIds: ["cloud", "sun", "rain"],
    promptWord: "cloud",
    options: [option("cloud", CLOUD), option("sun", SUN), option("rain", RAIN)],
    answerId: "cloud",
    hints: [
      {
        es: "Es blanca y flota en el cielo.",
        en: "It is white and floats in the sky.",
      },
    ],
  }),
  buildMatchingPairs({
    id: "weather-01-pairs",
    worldId: "weather-mountain",
    lessonId: "weather-01",
    order: 3,
    vocabularyIds: ["sun", "rain", "cloud"],
    pairs: [
      pairOf("p-sun", "sun", SUN),
      pairOf("p-rain", "rain", RAIN),
      pairOf("p-cloud", "cloud", CLOUD),
    ],
  }),
  buildSentenceCompletion({
    id: "weather-01-complete",
    worldId: "weather-mountain",
    lessonId: "weather-01",
    order: 4,
    vocabularyIds: ["sun", "rain", "snow"],
    sentence: "The ___ is in the sky and it is yellow.",
    translation: "El sol esta en el cielo y es amarillo.",
    options: [word("sun", "sun"), word("rain", "rain"), word("snow", "snow")],
    answerId: "sun",
    hints: [
      {
        es: "Es el astro que da calor y luz.",
        en: "It is the star that gives heat and light.",
      },
    ],
  }),
  buildWordBuilder({
    id: "weather-01-build",
    worldId: "weather-mountain",
    lessonId: "weather-01",
    order: 5,
    vocabularyIds: ["rain"],
    answer: "rain",
    translation: "lluvia",
    extraTokens: ["r", "i", "n", "a"],
    hints: [
      {
        es: "Empieza por rai y acaba en n.",
        en: "Start with rai and finish with n.",
      },
    ],
  }),
  buildListenAndChoose({
    id: "weather-02-listen",
    worldId: "weather-mountain",
    lessonId: "weather-02",
    order: 1,
    vocabularyIds: ["snow", "storm", "wind"],
    say: "snow",
    options: [option("snow", SNOW), option("storm", STORM), option("wind", WIND)],
    answerId: "snow",
    hints: [
      {
        es: "Cae blanca y fria desde el cielo en invierno.",
        en: "It falls white and cold from the sky in winter.",
      },
    ],
  }),
  buildImageChoice({
    id: "weather-02-choice",
    worldId: "weather-mountain",
    lessonId: "weather-02",
    order: 2,
    vocabularyIds: ["wind", "snow", "storm"],
    promptWord: "wind",
    options: [option("wind", WIND), option("snow", SNOW), option("storm", STORM)],
    answerId: "wind",
    hints: [
      {
        es: "No se ve, pero mueve las hojas y las nubes.",
        en: "You cannot see it, but it moves the leaves and the clouds.",
      },
    ],
  }),
  buildMatchingPairs({
    id: "weather-02-pairs",
    worldId: "weather-mountain",
    lessonId: "weather-02",
    order: 3,
    vocabularyIds: ["wind", "snow", "storm", "hot"],
    pairs: [
      pairOf("p-wind", "wind", WIND),
      pairOf("p-snow", "snow", SNOW),
      pairOf("p-storm", "storm", STORM),
      pairOf("p-hot", "hot", HOT),
    ],
  }),
  buildSentenceCompletion({
    id: "weather-02-complete",
    worldId: "weather-mountain",
    lessonId: "weather-02",
    order: 4,
    vocabularyIds: ["hot", "cold"],
    sentence: "It is hot today: take off your ___.",
    translation: "Hace calor hoy: ponte la chaqueta.",
    options: [word("jacket", "jacket"), word("socks", "socks"), word("sofa", "sofa")],
    answerId: "jacket",
    hints: [
      {
        es: "Es la prenda de Clothes Street que abriga cuando hace frio.",
        en: "It is the Clothes Street item that keeps you warm when it is cold.",
      },
    ],
  }),
  buildWordBuilder({
    id: "weather-02-build",
    worldId: "weather-mountain",
    lessonId: "weather-02",
    order: 5,
    vocabularyIds: ["snow"],
    answer: "snow",
    translation: "nieve",
    extraTokens: ["n", "o", "w", "s"],
    hints: [
      {
        es: "Son cuatro letras y empieza por sn.",
        en: "It has four letters and starts with sn.",
      },
    ],
  }),
  buildListenAndChoose({
    id: "weather-03-listen",
    worldId: "weather-mountain",
    lessonId: "weather-03",
    order: 1,
    vocabularyIds: ["sunny", "sun", "cold"],
    say: "It is sunny today",
    options: [option("sunny", SUNNY), option("sun", SUN), option("cold", COLD)],
    answerId: "sunny",
    hints: [
      {
        es: "Describe el dia: hay sol y no hay nubes.",
        en: "It describes the day: there is sun and no clouds.",
      },
    ],
  }),
  buildImageChoice({
    id: "weather-03-choice",
    worldId: "weather-mountain",
    lessonId: "weather-03",
    order: 2,
    vocabularyIds: ["cold", "hot", "sunny"],
    promptWord: "cold",
    options: [option("cold", COLD), option("hot", HOT), option("sunny", SUNNY)],
    answerId: "cold",
    hints: [
      {
        es: "El termometro marca bajo y hace falta abrigarse.",
        en: "The thermometer reads low and you need warm clothes.",
      },
    ],
  }),
  buildMatchingPairs({
    id: "weather-03-pairs",
    worldId: "weather-mountain",
    lessonId: "weather-03",
    order: 3,
    vocabularyIds: ["cold", "weather", "sunny", "rain"],
    pairs: [
      pairOf("p-cold", "cold", COLD),
      pairOf("p-weather", "weather", WEATHER),
      pairOf("p-sunny", "sunny", SUNNY),
      pairOf("p-rain", "rain", RAIN),
    ],
  }),
  buildSentenceCompletion({
    id: "weather-03-complete",
    worldId: "weather-mountain",
    lessonId: "weather-03",
    order: 4,
    vocabularyIds: ["cold", "hot", "sunny"],
    sentence: "Take your jacket: it is ___ today.",
    translation: "Lleva tu chaqueta: hoy hace frio.",
    options: [word("cold", "cold"), word("hot", "hot"), word("sunny", "sunny")],
    answerId: "cold",
    hints: [
      {
        es: "Por eso llevas la chaqueta puesta.",
        en: "That is why you are wearing the jacket.",
      },
    ],
  }),
  buildWordBuilder({
    id: "weather-03-build",
    worldId: "weather-mountain",
    lessonId: "weather-03",
    order: 5,
    vocabularyIds: ["sunny"],
    mode: "words",
    answer: "It is sunny today",
    translation: "hoy hace sol",
    extraTokens: ["snow"],
    hints: [
      {
        es: "Empieza con It is y termina con el dia con sol.",
        en: "Start with It is and finish with the day that has sun.",
      },
    ],
  }),
  buildStoryQuiz({
    id: "weather-03-story",
    worldId: "weather-mountain",
    lessonId: "weather-03",
    order: 6,
    vocabularyIds: ["sunny", "storm", "wind", "cold"],
    difficulty: 2,
    title: { es: "El parte del tiempo", en: "The weather report" },
    sentences: [
      { en: "Today Lina is the weather reporter.", es: "Hoy Lina es la reportera del tiempo." },
      {
        en: "In the morning the sun is out and it is hot.",
        es: "Por la manana sale el sol y hace calor.",
      },
      {
        en: "In the afternoon there are dark clouds and a storm.",
        es: "Por la tarde aparecen nubes oscuras y una tormenta.",
      },
      {
        en: "At night the wind brings cold rain.",
        es: "De noche el viento trae lluvia fria.",
      },
    ],
    questions: [
      {
        id: "weather-story-q1",
        prompt: {
          es: "¿Como esta el tiempo por la manana?",
          en: "What is the weather like in the morning?",
        },
        options: [
          word("weather-story-q1-hot", "Sunny and hot"),
          word("weather-story-q1-cold", "Cold and rainy"),
          word("weather-story-q1-storm", "Dark and stormy"),
        ],
        answerId: "weather-story-q1-hot",
      },
      {
        id: "weather-story-q2",
        prompt: {
          es: "¿Que aparece por la tarde?",
          en: "What appears in the afternoon?",
        },
        options: [
          word("weather-story-q2-storm", "Dark clouds and a storm"),
          word("weather-story-q2-sun", "The bright sun"),
          word("weather-story-q2-snow", "White snow"),
        ],
        answerId: "weather-story-q2-storm",
      },
      {
        id: "weather-story-q3",
        prompt: {
          es: "¿Que trae el viento de noche?",
          en: "What does the wind bring at night?",
        },
        options: [
          word("weather-story-q3-rain", "Cold rain"),
          word("weather-story-q3-hot", "Hot air"),
          word("weather-story-q3-sun", "Sunlight"),
        ],
        answerId: "weather-story-q3-rain",
      },
    ],
  }),
];
