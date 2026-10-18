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

const APPLE = imageVisual("apple", "Una manzana roja con hoja");
const BANANA = imageVisual("banana", "Un platano amarillo");
const ORANGE = imageVisual("orange", "Una naranja partida");
const BREAD = imageVisual("bread", "Una hogaza de pan");
const MILK = imageVisual("milk", "Un brik de leche");
const EGG = imageVisual("egg", "Un huevo blanco");
const CHEESE = imageVisual("cheese", "Un trozo de queso con agujeros");
const WATER = imageVisual("water", "Un vaso de agua");
const PIZZA = imageVisual("pizza", "Una porcion de pizza");
const RICE = imageVisual("rice", "Un bol de arroz con palillos");

const option = (id: string, visual: VocabularyVisual): ChoiceOption => ({ id, visual });
const word = (id: string, label: string): ChoiceOption => ({ id, label });

const pairOf = (id: string, label: string, visual: VocabularyVisual): MatchingPair => ({
  id,
  left: { id, label },
  right: { id, visual },
});

/** Mundo 6: Food Market. */
export const FOOD_MARKET_ACTIVITIES: readonly Activity[] = [
  buildListenAndChoose({
    id: "food-01-listen",
    worldId: "food-market",
    lessonId: "food-01",
    order: 1,
    vocabularyIds: ["apple", "banana", "orange-fruit"],
    say: "apple",
    options: [option("apple", APPLE), option("banana", BANANA), option("orange-fruit", ORANGE)],
    answerId: "apple",
    hints: [{ es: "Es roja y crujiente.", en: "It is red and crunchy." }],
  }),
  buildImageChoice({
    id: "food-01-choice",
    worldId: "food-market",
    lessonId: "food-01",
    order: 2,
    vocabularyIds: ["banana", "apple", "orange-fruit"],
    promptWord: "banana",
    options: [option("banana", BANANA), option("apple", APPLE), option("orange-fruit", ORANGE)],
    answerId: "banana",
    hints: [{ es: "Es larga y amarilla.", en: "It is long and yellow." }],
  }),
  buildMatchingPairs({
    id: "food-01-pairs",
    worldId: "food-market",
    lessonId: "food-01",
    order: 3,
    vocabularyIds: ["apple", "banana", "orange-fruit"],
    pairs: [
      pairOf("p-apple", "apple", APPLE),
      pairOf("p-banana", "banana", BANANA),
      pairOf("p-orange", "orange", ORANGE),
    ],
  }),
  buildWordBuilder({
    id: "food-01-build",
    worldId: "food-market",
    lessonId: "food-01",
    order: 4,
    vocabularyIds: ["apple"],
    answer: "apple",
    translation: "manzana",
    extraTokens: ["p", "l", "e", "a"],
    hints: [{ es: "Empieza por app y termina en -le.", en: "Start with app and finish with -le." }],
  }),
  buildListenAndChoose({
    id: "food-02-listen",
    worldId: "food-market",
    lessonId: "food-02",
    order: 1,
    vocabularyIds: ["milk", "water", "egg"],
    say: "milk",
    options: [option("milk", MILK), option("water", WATER), option("egg", EGG)],
    answerId: "milk",
    hints: [{ es: "Es blanca y viene en un brik.", en: "It is white and comes in a carton." }],
  }),
  buildImageChoice({
    id: "food-02-choice",
    worldId: "food-market",
    lessonId: "food-02",
    order: 2,
    vocabularyIds: ["cheese", "bread", "milk"],
    promptWord: "cheese",
    options: [option("cheese", CHEESE), option("bread", BREAD), option("milk", MILK)],
    answerId: "cheese",
    hints: [{ es: "Tiene agujeros en el dibujo.", en: "It has holes in the picture." }],
  }),
  buildMatchingPairs({
    id: "food-02-pairs",
    worldId: "food-market",
    lessonId: "food-02",
    order: 3,
    vocabularyIds: ["bread", "milk", "egg", "cheese"],
    pairs: [
      pairOf("p-bread", "bread", BREAD),
      pairOf("p-milk", "milk", MILK),
      pairOf("p-egg", "egg", EGG),
      pairOf("p-cheese", "cheese", CHEESE),
    ],
  }),
  buildSentenceCompletion({
    id: "food-02-complete",
    worldId: "food-market",
    lessonId: "food-02",
    order: 4,
    vocabularyIds: ["milk", "water", "egg"],
    sentence: "Can I have some ___, please? It is white and comes in a carton.",
    translation: "¿Me das leche, por favor? Es blanca y viene en un brik.",
    options: [word("milk", "milk"), word("water", "water"), word("egg", "egg")],
    answerId: "milk",
    hints: [
      {
        es: "Es la unica que se bebe del brik blanco.",
        en: "It is the only one you drink from a white carton.",
      },
    ],
  }),
  buildWordBuilder({
    id: "food-02-build",
    worldId: "food-market",
    lessonId: "food-02",
    order: 5,
    vocabularyIds: ["bread"],
    answer: "bread",
    translation: "pan",
    extraTokens: ["a", "d", "r"],
    hints: [{ es: "Suena como bred.", en: "It sounds like bred." }],
  }),
  buildListenAndChoose({
    id: "food-03-listen",
    worldId: "food-market",
    lessonId: "food-03",
    order: 1,
    vocabularyIds: ["pizza", "rice", "bread"],
    say: "I like pizza",
    options: [option("pizza", PIZZA), option("rice", RICE), option("bread", BREAD)],
    answerId: "pizza",
    hints: [
      {
        es: "Es la comida con forma de triangulo y pepperoni.",
        en: "It is the triangle-shaped food with pepperoni.",
      },
    ],
  }),
  buildImageChoice({
    id: "food-03-choice",
    worldId: "food-market",
    lessonId: "food-03",
    order: 2,
    vocabularyIds: ["rice", "pizza", "apple"],
    promptWord: "rice",
    options: [option("rice", RICE), option("pizza", PIZZA), option("apple", APPLE)],
    answerId: "rice",
    hints: [{ es: "Son granitos blancos en un bol.", en: "They are little white grains in a bowl." }],
  }),
  buildMatchingPairs({
    id: "food-03-pairs",
    worldId: "food-market",
    lessonId: "food-03",
    order: 3,
    vocabularyIds: ["pizza", "rice", "water", "apple"],
    pairs: [
      pairOf("p-pizza", "pizza", PIZZA),
      pairOf("p-rice", "rice", RICE),
      pairOf("p-water", "water", WATER),
      pairOf("p-apple", "apple", APPLE),
    ],
  }),
  buildSentenceCompletion({
    id: "food-03-complete",
    worldId: "food-market",
    lessonId: "food-03",
    order: 4,
    vocabularyIds: ["rice", "water"],
    sentence: "___ I have some rice, please?",
    translation: "¿Me das arroz, por favor?",
    options: [word("Can", "Can"), word("Am", "Am"), word("Is", "Is")],
    answerId: "Can",
    hints: [
      {
        es: "Asi se pide algo con cortesia: Can I have...?",
        en: "This is how you ask politely: Can I have...?",
      },
    ],
  }),
  buildWordBuilder({
    id: "food-03-build",
    worldId: "food-market",
    lessonId: "food-03",
    order: 5,
    vocabularyIds: ["rice", "pizza"],
    mode: "words",
    answer: "I like rice and pizza",
    translation: "me gusta el arroz y la pizza",
    extraTokens: ["water"],
    hints: [
      {
        es: "Empieza con I y termina con la comida triangulo.",
        en: "Start with I and finish with the triangle food.",
      },
    ],
  }),
  buildStoryQuiz({
    id: "food-03-story",
    worldId: "food-market",
    lessonId: "food-03",
    order: 6,
    vocabularyIds: ["apple", "milk", "rice", "pizza"],
    difficulty: 2,
    title: { es: "La cena en el mercado", en: "Dinner at the market" },
    sentences: [
      { en: "Mia works at the food market.", es: "Mia trabaja en el mercado." },
      { en: "She sells apples, bananas and bread.", es: "Vende manzanas, platanos y pan." },
      { en: "Pip buys milk and an egg.", es: "Pip compra leche y un huevo." },
      { en: "They cook rice and share a pizza.", es: "Cocinan arroz y comparten una pizza." },
    ],
    questions: [
      {
        id: "food-story-q1",
        prompt: { es: "¿Que vende Mia?", en: "What does Mia sell?" },
        options: [
          word("food-story-q1-fruit", "Apples, bananas and bread"),
          word("food-story-q1-drink", "Milk and water"),
          word("food-story-q1-dinner", "Rice and pizza"),
        ],
        answerId: "food-story-q1-fruit",
      },
      {
        id: "food-story-q2",
        prompt: { es: "¿Que compra Pip?", en: "What does Pip buy?" },
        options: [
          word("food-story-q2-milk-egg", "Milk and an egg"),
          word("food-story-q2-cheese", "Cheese and bread"),
          word("food-story-q2-apple", "An apple and a banana"),
        ],
        answerId: "food-story-q2-milk-egg",
      },
      {
        id: "food-story-q3",
        prompt: { es: "¿Que comen al final?", en: "What do they eat at the end?" },
        options: [
          word("food-story-q3-pizza", "A pizza"),
          word("food-story-q3-bread", "Bread"),
          word("food-story-q3-egg", "An egg"),
        ],
        answerId: "food-story-q3-pizza",
      },
    ],
  }),
];
