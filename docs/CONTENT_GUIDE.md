# CONTENT_GUIDE - Guia de contenido

Este documento explica como añadir vocabulario, lecciones y actividades sin romper
la validacion ni la experiencia pedagogica.

## 1. Principios pedagogicos

- Sesiones de 10-15 minutos. Nada de rachas obligatorias ni penalizaciones.
- Pocas palabras nuevas por sesion; repaso frecuente de lo anterior.
- Corregir con amabilidad: **nunca** quitar XP por un error.
- El audio siempre tiene alternativa visual/texto.
- Ingles como lengua objetivo; español como apoyo (y cada vez menos).
- Contenido original. No usar imagenes con copyright ni personajes de videojuegos.
  Los SVG del proyecto son originales y se versionan en `public/images`.

## 2. Estructura del contenido

```
src/content/
├── worlds/index.ts          # metadatos y orden de mundos
├── vocabulary/<world>.ts    # palabras por mundo
├── lessons/<world>.ts       # lecciones por mundo
├── activities/<world>.ts    # actividades por mundo
└── index.ts                 # agregacion + indices de busqueda
```

## 3. Vocabulario (`VocabularyItem`)

```ts
{
  id: 'red',                     // estable, unico, kebab-case, sin acentos
  worldId: 'color-forest',
  word: 'red',
  translation: 'rojo',
  partOfSpeech: 'adjective',
  phonetic: 'red',               // ayuda orientativa NO IPA (si no es IPA real)
  // Union tipada: nunca se inventan archivos. O SVG original versionado,
  // o el visual se dibuja con datos (color/cantidad).
  visual: { kind: 'color', hex: '#e11d48', alt: 'Circulo rojo' },
  audio: null,                   // null => se usa TTS del navegador
  example: { en: "The apple is red.", es: "La manzana es roja." },
  acceptedAnswers: ['red'],
  tags: ['colors', 'beginner'],
  objective: 'Reconocer el color rojo al escucharlo',
  source: { kind: 'original', license: 'CC0-1.0', url: null },
  contentVersion: 1
}
```

Reglas:

- `visual` es una union tipada: `{ kind: 'image', src, alt }` debe apuntar a un SVG real en `public/`; `{ kind: 'color', hex, alt }` y `{ kind: 'count', count, alt }` se dibujan con datos. Si un `kind: 'image'` no existe, la validacion falla.
- `acceptedAnswers` nunca vacio.
- `phonetic` es ayuda, no se presenta como IPA salvo que lo sea.

## 4. Actividades

Tipos y forma del `answerKey`:

| Tipo                  | `content`                                 | `answerKey`                            |
| --------------------- | ----------------------------------------- | -------------------------------------- |
| `listen-and-choose`   | `stimulus` (audio/texto) + `options[]`    | `{ optionId }`                         |
| `image-choice`        | `options[]`                               | `{ optionId }`                         |
| `matching-pairs`      | `pairs[]` (left/right)                    | `{ pairs: { leftId, rightId }[] }`     |
| `word-builder`        | `tokens[]`, `mode: 'letters' \| 'words'`  | `{ text }`                             |
| `sentence-completion` | `sentence` con `___` + `options[]`        | `{ optionId }`                         |
| `speak-and-check`     | `target`, `acceptedAnswers[]`             | `{ acceptedAnswers[] }`                |
| `camera-hunt`         | `target`, `why`, `fallbackOptions[]`      | `{ optionId }`                         |
| `story-quiz`          | `title`, `sentences[]`, `questions[]`     | `{ questions: { questionId, optionId }[] }` |

Reglas:

- 3-4 opciones como maximo por actividad de eleccion.
- La respuesta correcta **siempre** debe estar entre las opciones.
- Distractores plausibles pero inequivocos.
- `hints` en español, amables y utiles.
- `skill` ∈ `listening | reading | vocabulary | speaking | writing`.
- Cada mundo: al menos 1 actividad de listening y 1 de lectura/seleccion.

### Mini-historias (`story-quiz`)

Una historia corta con 3-4 preguntas de comprension. Refuerza la lectura sin
depender de audio ni microfono, y cierra cada mision final.

- `sentences`: frases breves en ingles con su apoyo en español (se muestra solo
  si el perfil tiene activada la ayuda).
- `questions[].prompt`: pregunta en ambos idiomas; opciones con `textOption`.
- Los `id` de opciones deben ser **unicos en toda la historia**: la interfaz
  resalta la solucion a partir de `evaluation.correctOptionIds`.
- La solucion vive **solo** en `answerKey.questions`, nunca dentro de `content`
  (ADR 0004). `buildStoryQuiz` se ocupa de eso.
- La respuesta del jugador es `{ kind: 'quiz', answers: [{ questionId, optionId }] }`;
  el motor corrige pregunta por pregunta y solo da por bueno el quiz completo.

## 5. Lecciones

- 3-5 lecciones por mundo, 8-15 palabras nuevas repartidas.
- 2-4 estructuras comunicativas introducidas gradualmente.
- `estimatedMinutes` realista (6-10).
- La mision final no tiene limite de tiempo.

## 6. Añadir un mundo nuevo

1. Crear `worlds/index.ts` entrada con `order`, `prerequisites`, `badgeId`.
2. Crear vocabulario, leccion y actividades (archivos del mundo).
3. Registrar en `src/content/index.ts`.
4. Añadir los SVG originales a `public/images/vocabulary/` (solo para `visual.kind: 'image'`).
5. Ejecutar `npm run validate:content` y `npm test`.

## 7. Reglas de validacion automatica

`scripts/validate-content.ts` comprueba:

- IDs unicos en cada coleccion.
- Toda referencia (`worldId`, `lessonId`, `vocabularyIds`, `badgeId`) existe.
- Los recursos `visual.kind: 'image'` y los audios referenciados existen en `public/`.
- La respuesta correcta esta entre las opciones (y `answerKey` es coherente con el tipo).
- `prompt.es` presente; traducciones requeridas completas.
- `order` de mundos/lecciones sin huecos ni duplicados.
- `acceptedAnswers` no vacio.
- Todos los mundos tienen al menos una actividad de listening.

Si la validacion falla, se imprime un informe accionable y el proceso sale con
codigo distinto de cero.
