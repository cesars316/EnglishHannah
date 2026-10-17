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
  image: '/images/vocabulary/red.svg',
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
- `image` debe existir en `public/`. Si aún no hay SVG, la validacion falla.
- `acceptedAnswers` nunca vacio.
- `phonetic` es ayuda, no se presenta como IPA salvo que lo sea.

## 4. Actividades

Tipos del MVP y forma del `answerKey`:

| Tipo | `content` | `answerKey` |
| --- | --- | --- |
| `listen-and-choose` | `stimulus` (audio/texto) + `options[]` | `{ optionId }` |
| `image-choice` | `options[]` | `{ optionId }` |
| `matching-pairs` | `pairs[]` (left/right) | `{ pairs: { leftId, rightId }[] }` |
| `word-builder` | `tokens[]`, `mode: 'letters' \| 'words'` | `{ text }` |
| `sentence-completion` | `sentence` con `___` + `options[]` | `{ optionId }` |

Reglas:
- 3-4 opciones como maximo por actividad de eleccion.
- La respuesta correcta **siempre** debe estar entre las opciones.
- Distractores plausibles pero inequivocos.
- `hints` en español, amables y utiles.
- `skill` ∈ `listening | reading | vocabulary | speaking | writing`.
- Cada mundo: al menos 1 actividad de listening y 1 de lectura/seleccion.

## 5. Lecciones

- 3-5 lecciones por mundo, 8-15 palabras nuevas repartidas.
- 2-4 estructuras comunicativas introducidas gradualmente.
- `estimatedMinutes` realista (6-10).
- La mision final no tiene limite de tiempo.

## 6. Añadir un mundo nuevo

1. Crear `worlds/index.ts` entrada con `order`, `prerequisites`, `badgeId`.
2. Crear vocabulario, leccion y actividades (archivos del mundo).
3. Registrar en `src/content/index.ts`.
4. Añadir los SVG a `public/images/vocabulary/`.
5. Ejecutar `npm run validate:content` y `npm test`.

## 7. Reglas de validacion automatica

`scripts/validate-content.ts` comprueba:

- IDs unicos en cada coleccion.
- Toda referencia (`worldId`, `lessonId`, `vocabularyIds`, `badgeId`) existe.
- Las imagenes y audios referenciados existen en `public/`.
- La respuesta correcta esta entre las opciones (y `answerKey` es coherente con el tipo).
- `prompt.es` presente; traducciones requeridas completas.
- `order` de mundos/lecciones sin huecos ni duplicados.
- `acceptedAnswers` no vacio.
- Todos los mundos tienen al menos una actividad de listening.

Si la validacion falla, se imprime un informe accionable y el proceso sale con
codigo distinto de cero.
