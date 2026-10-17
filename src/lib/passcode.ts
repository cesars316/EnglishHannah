/**
 * Reglas del codigo parental.
 *
 * Vive en `lib` porque la comparten el cliente (comprobacion inmediata al
 * escribirlo) y el servidor (autoridad). Es codigo puro: no toca `window`.
 */

export const PASSCODE_MIN_LENGTH = 4;
export const PASSCODE_MAX_LENGTH = 12;

/** Solo letras y numeros: facil de teclear en una tablet. */
const ALLOWED = /^[a-zA-Z0-9]+$/;
const REPEATED = /^(\d)\1+$/;
const EASY = /^(1234|12345|123456|0000|1111)$/;

export type PasscodeValidation = { ok: true } | { ok: false; message: string };

/** El codigo es facil de recordar para el adulto pero no obvio para la niña. */
export function validatePasscodeFormat(passcode: string): PasscodeValidation {
  if (passcode.length < PASSCODE_MIN_LENGTH || passcode.length > PASSCODE_MAX_LENGTH) {
    return { ok: false, message: `Usa entre ${PASSCODE_MIN_LENGTH} y ${PASSCODE_MAX_LENGTH} caracteres.` };
  }
  if (!ALLOWED.test(passcode)) {
    return { ok: false, message: "Usa solo letras y numeros, sin espacios ni simbolos." };
  }
  if (REPEATED.test(passcode)) {
    return { ok: false, message: "Evita repetir el mismo caracter." };
  }
  if (EASY.test(passcode)) {
    return { ok: false, message: "Ese codigo es demasiado facil de adivinar." };
  }
  return { ok: true };
}
