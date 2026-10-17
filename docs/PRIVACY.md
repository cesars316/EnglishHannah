# Privacidad y datos infantiles - English Quest

> Ultima actualizacion: 2026-10-17
>
> Este documento describe el comportamiento del software. **No constituye una
> declaracion de cumplimiento legal.** Antes de abrir la aplicacion a otros niños o
> de publicarla, revisa las obligaciones aplicables de proteccion de datos de menores
> (en Colombia: Ley 1581 de 2012 y normas concordantes) y las condiciones vigentes de
> Vercel, MongoDB Atlas y cualquier proveedor de voz.

## 1. Datos que se recogen

| Dato                                                                | Finalidad                          | Obligatorio                         |
| ------------------------------------------------------------------- | ---------------------------------- | ----------------------------------- |
| Alias del perfil (ej. "Explorer")                                   | Mostrarlo en el juego              | Si (editable, no es el nombre real) |
| Avatar elegido                                                      | Personalizacion                    | Si                                  |
| Idioma de apoyo (`es-CO`) y objetivo (`en-US`)                      | Presentar el contenido             | Si                                  |
| Progreso de aprendizaje (palabras vistas, aciertos/errores, fechas) | Guardar el avance y sugerir repaso | Si                                  |
| XP, monedas, insignias, desbloqueos                                 | Progresion del juego               | Si                                  |
| Preferencias (sonido, microfono, camara, movimiento reducido)       | Respetar la eleccion del adulto    | Si                                  |
| Codigo parental (hash scrypt)                                       | Proteger la zona de adultos        | Si (lo crea el adulto)              |

**No se recogen:** nombre real y apellidos, fecha de nacimiento exacta, colegio,
direccion, ubicacion/geolocalizacion, telefono, correo, contactos, biometria ni
publicidad/rastreadores de terceros.

## 2. Donde se guardan

- **MongoDB** (local en desarrollo; MongoDB Atlas Free en despliegue): perfil,
  progreso, intentos y estado del juego. No se guarda contenido pedagogico.
- **Cookie `eq_session`** (httpOnly, firmada con HMAC): identifica el
  dispositivo/adulto. No contiene datos del niño.
- **Cookie `eq_parent`** (httpOnly, 30 min): autoriza temporalmente las acciones
  sensibles tras verificar el codigo parental.
- **localStorage del navegador**: **unicamente** la preferencia `eq.activeProfileId`
  (que perfil esta activo en este dispositivo). No contiene progreso ni ningun dato
  del menor, y se puede borrar en cualquier momento.

> El servidor es la autoridad del progreso (ADR 0003/0004). El navegador nunca
> calcula XP, monedas, dominio ni desbloqueos: los pide a `/api/v1`.

## 3. Periodo de conservacion

- El progreso y el perfil se conservan mientras el adulto no los borre.
- El unico dato en `localStorage` (`eq.activeProfileId`) es una preferencia de
  interfaz y desaparece al borrar los datos del navegador.
- Logs tecnicos del servidor: solo agregados, sin datos infantiles identificables.

## 4. Borrado y exportacion

- `DELETE /api/v1/profiles/:profileId` (autorizacion parental) elimina el perfil y,
  en cascada, su `progress`, sus `activityAttempts` y su `gameState`.
- La zona parental ofrece **exportar** (JSON) y **borrar** el perfil.
- Borrar la cookie de sesion desvincula el dispositivo del progreso guardado.

## 5. Microfono

- Desactivado por defecto. Se activa solo si el adulto lo habilita en ajustes y la
  niña pulsa un boton explicito.
- Se usa la Web Speech API (`SpeechRecognition`/`webkitSpeechRecognition`).
- El texto reconocido se compara **en memoria** con respuestas aceptadas y se
  descarta. **No se almacena ni se envia a nuestro backend.**
- Limitacion importante: la API del navegador **puede enviar el audio a servidores del
  proveedor** (Google, Microsoft, Apple). No se garantiza procesamiento local ni
  privacidad absoluta.
- Siempre existe la alternativa manual "Ya lo dije" (autoevaluacion) sin penalizacion.
- No se usa la voz para identificar a nadie (sin biometria).

## 6. Camara

- Desactivada por defecto. Solo se abre tras pulsar un boton explicito y con permiso
  del navegador.
- Existe un indicador visible mientras esta activa y un boton que la apaga y libera
  todas las pistas (`track.stop()`).
- **No se capturan fotogramas, no se sube y no se guarda nada.** No hay
  reconocimiento de objetos: la confirmacion es siempre manual.
- Fallback: completar la mision sin camara eligiendo entre ilustraciones o
  confirmando fuera de camara.
- Requiere HTTPS en produccion y `localhost` en desarrollo.

## 7. Terceros

| Tercero                                         | Uso                              | Datos                                         |
| ----------------------------------------------- | -------------------------------- | --------------------------------------------- |
| Proveedor de navegador (Google/Microsoft/Apple) | Sintesis y reconocimiento de voz | Puede recibir audio si se usa el microfono    |
| MongoDB Atlas (opcional, despliegue)            | Almacenar progreso               | Alias y progreso, sin datos personales reales |
| Vercel (opcional, despliegue)                   | Hosting                          | Logs tecnicos                                 |
| Nuestra app                                     | Todo lo demas                    | Sin analitica invasiva ni publicidad          |

## 8. Consentimiento y control del adulto

- La zona parental permite activar/desactivar microfono y camara, sonido y movimiento
  reducido.
- La niña nunca puede entrar en la zona parental sin el codigo del adulto.
- No hay perfiles publicos, chat abierto, publicaciones ni comparacion con otros niños.

## 9. Recomendaciones antes de publicar

1. Crear el cluster con region cercana y backup segun politica de borrado.
2. Forzar HTTPS y revisar las cabeceras de seguridad y la CSP.
3. Revisar terminos y condiciones de cada plan gratuito.
4. Añadir un aviso de consentimiento parental previo al primer uso en produccion.
5. Migrar a OAuth si la app deja de ser de uso familiar y pasa a multiusuario publico.
