# ADR 0001 - Stack tecnico del MVP

- **Estado:** aceptado
- **Fecha:** 2026-10-16
- **Contexto:** se necesita construir una app web educativa, con coste cero o casi cero,
  facil de operar y de desplegar en planes gratuitos, mantenida por una sola persona.

## Decision

| Capa                   | Eleccion                                             | Version fijada |
| ---------------------- | ---------------------------------------------------- | -------------- |
| Framework              | Next.js (App Router)                                 | 16.4.x         |
| UI                     | React                                                | 19.3.x         |
| Lenguaje               | TypeScript estricto                                  | 5.9.3          |
| Estilos                | Tailwind CSS (+ `@tailwindcss/postcss`)              | 4.3.x          |
| Persistencia           | MongoDB driver oficial (sin Mongoose)                | 7.7.x          |
| Validacion             | Zod                                                  | 4.6.x          |
| Pruebas unitarias      | Vitest + jsdom                                       | 5.0.x          |
| Pruebas de componentes | React Testing Library + jest-dom                     | 16.3.x / 7.0.x |
| Pruebas E2E            | Playwright                                           | 1.64.x         |
| Lint/format            | ESLint (flat config) + eslint-config-next + Prettier | 10.x / 3.9.x   |
| CI                     | GitHub Actions                                       | -              |
| Deploy (futuro)        | Vercel Hobby + MongoDB Atlas Free                    | -              |

## Por que TypeScript 5.9.3 y no 7.0.2

`typescript@latest` es 7.0.2 (compilador nativo nuevo). `typescript-eslint@8.71.2`
declara `peerDependencies.typescript: ">=4.8.4 <6.1.0"`. Usar TS 7 romperia el lint
tipado. Se fija **5.9.3** (ultima 5.x estable) para conservar `strict` real + lint.
Se revisara TS 7 cuando `typescript-eslint` lo soporte.

## Por que el driver oficial y no Mongoose

Modelo explicito, sin magia de esquemas, control total de indices e idempotencia.
Menos superficie de dependencias en un proyecto pequeno.

## Consecuencias

- Monolito modular full-stack: sin microservicios, sin CQRS, sin mensajeria.
- El acceso a MongoDB ocurre **solo** en servidor (`src/server`).
- Contratos compartidos entre cliente y servidor viven en `src/types` y `src/lib`.
- Se puede extraer la API a otro backend mas adelante sin cambiar el contrato publico.

## Alternativas descartadas

- **.NET/ASP.NET Core:** obligaria a mantener y pagar dos servicios; se puede extraer despues.
- **Mongoose:** abstraccion innecesaria para este tamaño.
- **Tailwind 3:** Tailwind 4 es la version actual y no requiere `tailwind.config.js`.
