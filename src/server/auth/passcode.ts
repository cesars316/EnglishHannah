import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { PASSCODE_MAX_LENGTH } from "@/lib/passcode";

/**
 * Derivacion del codigo parental en el servidor.
 *
 * - `scrypt` con sal aleatoria por propietario y 64 bytes de clave derivada.
 * - La comparacion es de tiempo constante (`timingSafeEqual`).
 * - Nunca se guarda el codigo en claro ni se registra en consola (ADR 0003).
 */

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const SALT_BYTES = 16;

export type PasscodeHash = { hash: string; salt: string };

export async function hashPasscode(passcode: string): Promise<PasscodeHash> {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const derived = await scrypt(passcode, salt, KEY_LENGTH);
  return { hash: derived.toString("hex"), salt };
}

export async function verifyPasscodeHash(
  passcode: string,
  stored: PasscodeHash,
): Promise<boolean> {
  if (!stored.hash || !stored.salt) return false;
  // Longitud acotada para no derivar claves de un codigo enorme enviado a mano.
  if (passcode.length === 0 || passcode.length > PASSCODE_MAX_LENGTH) return false;

  const derived = await scrypt(passcode, stored.salt, KEY_LENGTH);
  const expected = Buffer.from(stored.hash, "hex");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}
