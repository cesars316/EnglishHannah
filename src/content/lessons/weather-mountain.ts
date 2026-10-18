import { CONTENT_VERSION } from "@/config/game";
import type { Lesson } from "@/types/content";

/** Lecciones del mundo 10: Weather Mountain. */
export const WEATHER_MOUNTAIN_LESSONS: readonly Lesson[] = [
  {
    id: "weather-01",
    worldId: "weather-mountain",
    order: 1,
    title: { es: "Sol, nube y lluvia", en: "Sun, cloud and rain" },
    intro: {
      es: "La montana cambia de color cada hora. Aprende a nombrar el cielo.",
      en: "The mountain changes colour every hour. Learn to name the sky.",
    },
    objectives: [
      "Nombrar sun, cloud y rain",
      'Describir el cielo con "It is in the sky"',
      "Escribir la palabra rain",
    ],
    vocabularyIds: ["sun", "rain", "cloud"],
    activityIds: [
      "weather-01-listen",
      "weather-01-choice",
      "weather-01-pairs",
      "weather-01-complete",
      "weather-01-build",
    ],
    estimatedMinutes: 8,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "weather-02",
    worldId: "weather-mountain",
    order: 2,
    title: { es: "Viento, nieve y calor", en: "Wind, snow and heat" },
    intro: {
      es: "Arriba sopla el viento y cae la nieve; abajo hace calor. Sube preparado.",
      en: "Up high the wind blows and snow falls; down low it is hot. Climb prepared.",
    },
    objectives: [
      "Nombrar wind, snow, storm y hot",
      'Entender "It is hot, take off your jacket"',
      "Escribir la palabra snow",
    ],
    vocabularyIds: ["wind", "snow", "storm", "hot"],
    activityIds: [
      "weather-02-listen",
      "weather-02-choice",
      "weather-02-pairs",
      "weather-02-complete",
      "weather-02-build",
    ],
    estimatedMinutes: 9,
    isFinalMission: false,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
  {
    id: "weather-03",
    worldId: "weather-mountain",
    order: 3,
    title: { es: "Mision final: el parte del tiempo", en: "Final quest: the weather report" },
    intro: {
      es: "Eres la reportera del tiempo. Cuenta como esta el clima de la montana.",
      en: "You are the weather reporter. Tell everyone how the mountain weather is.",
    },
    objectives: [
      "Nombrar cold, weather y sunny",
      'Preguntar y responder "What is the weather like?"',
      "Leer una mini-historia del clima",
    ],
    vocabularyIds: ["cold", "weather", "sunny"],
    activityIds: [
      "weather-03-listen",
      "weather-03-choice",
      "weather-03-pairs",
      "weather-03-complete",
      "weather-03-build",
      "weather-03-story",
    ],
    estimatedMinutes: 10,
    isFinalMission: true,
    contentVersion: CONTENT_VERSION,
    published: true,
  },
] as const;
