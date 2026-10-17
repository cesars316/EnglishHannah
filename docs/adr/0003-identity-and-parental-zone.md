# ADR 0003 - Identidad de dispositivo y zona parental

- **Estado:** aceptado
- **Fecha:** 2026-10-16
- **Decision del propietario:** "Sesion de dispositivo + codigo parental".

## Contexto

El documento maestro admite dos opciones para el MVP familiar: (a) un unico perfil
local con identificador generado y persistencia de servidor; o (b) zona parental
autenticada con perfiles ligados al adulto. Prohibe explicitamente guardar
contraseñas en texto plano y **simular seguridad con un PIN fijo visible en el codigo**.

## Decision

1. **Identidad del dispositivo/adulto:** al primer uso el servidor genera un
   `ownerId` aleatorio (UUID v4) y lo firma con HMAC-SHA256 usando `AUTH_SECRET`.
   Se entrega en una cookie `eq_session` con `httpOnly`, `sameSite=lax`,
   `secure` en produccion, `path=/` y caducidad larga (180 dias).
   **Nunca se acepta un `ownerId` enviado libremente por el navegador.**

2. **Perfiles infantiles:** pertenecen al `ownerId` de la sesion. Toda operacion
   verifica pertenencia (`profiles.ownerId === session.ownerId`).

3. **Zona parental:** protegida por un **codigo que crea el propio adulto** en el
   primer acceso. Se almacena como `scrypt(code, salt)` (via `node:crypto`), nunca en
   texto plano y nunca como valor fijo en el codigo. Tras verificar el codigo, el
   servidor emite una cookie de corta duracion `eq_parent` (httpOnly, 30 min) que
   autoriza las operaciones sensibles (exportar, borrar, cambiar ajustes).

4. **Sin OAuth en el MVP.** No añade valor mientras la app no se publique a terceros
   y evita pedir credenciales. Si se activa Auth.js/Google, se documentara en un ADR
   nuevo y el `ownerId` pasara a derivarse de la cuenta autenticada.

## Anti-fuerza bruta

Verificacion del codigo parental con retardo progresivo y limite de intentos por
ventana (rate limiting en memoria por proceso). El codigo no se registra en logs.

## Consecuencias

- Si se borra la cookie, el dispositivo pierde el acceso al progreso de servidor.
  La UI lo advierte ("modo invitado") y permite seguir jugando con progreso local.
- Para despliegue publico multiusuario real, migrar a OAuth (documentado en
  `docs/PRIVACY.md` como recomendacion previa a publicar).
- El modo local sin login queda limitado a desarrollo o a almacenamiento local
  explicitamente etiquetado.
