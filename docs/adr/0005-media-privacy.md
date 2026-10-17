# ADR 0005 - Privacidad de medios: no se almacena audio, foto ni video

- **Estado:** aceptado
- **Fecha:** 2026-10-16

## Decision

1. **Texto a voz (TTS):** se usa `window.speechSynthesis` mediante la abstraccion
   `SpeechService`. No requiere permisos ni red obligatoria. Siempre existe fallback
   visual (la palabra y su transcripcion auxiliar se muestran en pantalla).

2. **Reconocimiento de voz (ASR):** opcional, desactivado por defecto
   (`settings.microphoneEnabled = false`). Solo se activa con accion explicita y con
   el permiso ya concedido por el adulto en ajustes. La abstraccion
   `SpeechRecognitionService` aísla la implementacion del navegador.

   - El transcript se usa **en memoria** para comparar con respuestas aceptadas y se
     descarta inmediatamente. **No se persiste ni se envia a nuestro backend.**
   - Se advierte que la API del navegador puede enviar audio a servicios del proveedor
     (Google/Microsoft/Apple). No se promete procesamiento local.
   - Siempre existe la alternativa manual "Ya lo dije" (autoevaluacion), sin penalizacion.
   - Los errores se registran solo por **tipo** (permiso denegado, sin dispositivo,
     timeout, no soportado). Nunca el contenido reconocido.

3. **Camara:** opcional. `getUserMedia({ video: true })` solo tras pulsar un boton
   explicito. Existe indicador visible de camara activa y boton que ejecuta
   `track.stop()` sobre **todas** las pistas. No se capturan fotogramas, no se sube ni
   se guarda nada, no se activa en segundo plano. Fallback obligatorio: completar la
   mision sin camara (seleccion de ilustracion o confirmacion fuera de camara).
   No se afirma deteccion automatica porque no hay reconocimiento de objetos.

4. **Nunca se guardan:** grabaciones de voz, fotografias, video, ubicacion,
   transcripciones identificables ni biometria.

## Consecuencias

- En `activityAttempts` los ejercicios de habla guardan solo `completed: true/false`
  y el tipo de fallback usado.
- `docs/PRIVACY.md` detalla datos, finalidad, conservacion, borrado y terceros.
- Antes de publicar se debe revisar el consentimiento parental y las condiciones
  vigentes de cada proveedor de voz.
