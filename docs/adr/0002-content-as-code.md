# ADR 0002 - Contenido como codigo, MongoDB solo para progreso

- **Estado:** aceptado
- **Fecha:** 2026-10-16

## Contexto

El documento maestro propone colecciones `worlds`, `lessons`, `vocabulary` y
`activities`, y a la vez pide elegir **una unica fuente de verdad por tipo de dato**
y no duplicar contenido en cada perfil.

## Decision

**Fuente de verdad del contenido pedagogico = codigo versionado en `src/content`
(TypeScript/JSON).** Mongo **no** almacena copias de mundos, lecciones, palabras ni
actividades en el MVP.

Mongo almacena unicamente estado del jugador:

- `owners` - identidad del adulto/dispositivo (ver ADR 0003).
- `profiles` - perfil infantil (alias, avatar, ajustes).
- `progress` - dominio por palabra/habilidad y programacion de repaso.
- `activityAttempts` - intentos registrados (con clave de idempotencia).
- `gameState` - XP, monedas, desbloqueos, insignias.

Se añade `scripts/validate-content.ts` que valida el contenido antes de compilar:
IDs unicos, referencias existentes, respuesta presente en opciones, recursos
existentes en `public/`, traducciones completas.

## Consecuencias

- Cambiar contenido = cambiar codigo + PR. Sin CMS (evita complejidad y coste).
- Se elimina el riesgo de contenido desincronizado entre Mongo y el repo.
- El bundle del cliente contiene las respuestas correctas. **Riesgo aceptado** en el
  MVP familiar, mitigado asi: la API nunca expone `answerKey` (ver ADR 0004) y el
  servidor revalida todo resultado que otorgue recompensa.
- Si en el futuro se necesita un CMS, se migrara el contenido a Mongo manteniendo
  el mismo contrato de lectura.

## Alcance del script de seed

El seed de Fase 3 solo crea **indices** y documentos de configuracion. Es idempotente
y no siembra contenido.
