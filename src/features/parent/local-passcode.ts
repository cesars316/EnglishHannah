import { readJson, removeKey, writeJson } from "@/lib/storage";

/**
 * Codigo parental en modo local (sin backend).
 *
 * - Nunca se guarda en texto plano ni como PIN fijo en el codigo (ADR 0003).
 * - Se deriva con PBKDF2-SHA256 y sal aleatoria usando WebCrypto.
 * - En Fase 3 el servidor pasa a ser la autoridad (scrypt + rate limiting);
 *   esta implementacion sirve para el modo invitado/offline.
 */

const PASSCODE_KEY = "eq.parent.passcode";
const UNLOCK_KEY = "eq.parent.unlockedUntil";

const ITERATIONS = 150_000;
const MIN_LENGTH = 4;
const MAX_LENGTH = 12;
const UNLOCK_TTL_MS = 30 * 60 * 1000;

type PasscodeRecord = {
  salt: string;
  hash: string;
  iterations: number;
  alphabet: "alphanumeric";
};

export function isPasscodeSupported(): boolean {
  return (
    typeof crypto !== "undefined" &&
    typeof crypto.subtle !== "undefined" &&
    typeof crypto.subtle.deriveBits === "function" &&
    typeof crypto.getRandomValues === "function"
  );
}

/** El codigo es facil de recordar para el adulto pero no obvio para la niña. */
export function validatePasscodeFormat(passcode: string): { ok: boolean; message?: string } {
  if (passcode.length < MIN_LENGTH || passcode.length > MAX_LENGTH) {
    return { ok: false, message: `Usa entre ${MIN_LENGTH} y ${MAX_LENGTH} caracteres.` };
  }
  if (!/^[a-zA-Z0-9]+$/.test(passcode)) {
    return { ok: false, message: "Usa solo letras y numeros, sin espacios ni simbolos." };
  }
  if (/^(\d)\1+$/.test(passcode)) {
    return { ok: false, message: "Evita repetir el mismo caracter." };
  }
  if (/^(1234|12345|123456|0000|1111)$/.test(passcode)) {
    return { ok: false, message: "Ese codigo es demasiado facil de adivinar." };
  }
  return { ok: true };
}

function toBase64(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function derive(passcode: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passcode),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations, hash: "SHA-256" },
    key,
    256,
  );
  return toBase64(bits);
}

export function hasPasscode(): boolean {
  return readJson<PasscodeRecord | null>(PASSCODE_KEY, null) !== null;
}

export async function setPasscode(passcode: string): Promise<void> {
  if (!isPasscodeSupported()) throw new Error("PASSCODE_UNSUPPORTED");
  const format = validatePasscodeFormat(passcode);
  if (!format.ok) throw new Error(format.message ?? "INVALID_PASSCODE");

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(passcode, salt, ITERATIONS);
  const record: PasscodeRecord = {
    salt: toBase64(salt.buffer as ArrayBuffer),
    hash,
    iterations: ITERATIONS,
    alphabet: "alphanumeric",
  };
  writeJson(PASSCODE_KEY, record);
  emitParentAuthChange();
}

export async function verifyPasscode(passcode: string): Promise<boolean> {
  const record = readJson<PasscodeRecord | null>(PASSCODE_KEY, null);
  if (!record) return false;
  if (!isPasscodeSupported()) return false;
  const hash = await derive(passcode, fromBase64(record.salt), record.iterations);
  return hash === record.hash;
}

export function clearPasscode(): void {
  removeKey(PASSCODE_KEY);
  removeKey(UNLOCK_KEY);
  emitParentAuthChange();
}

/** Marca la zona parental como desbloqueada durante una ventana corta. */
export function grantParentUnlock(): void {
  writeJson(UNLOCK_KEY, Date.now() + UNLOCK_TTL_MS);
  emitParentAuthChange();
}

export function hasParentUnlock(): boolean {
  const until = readJson<number>(UNLOCK_KEY, 0);
  return typeof until === "number" && until > Date.now();
}

export function revokeParentUnlock(): void {
  removeKey(UNLOCK_KEY);
  emitParentAuthChange();
}

/* -------------------------------------------------------------------------- */
/* Estado observable para la interfaz                                         */
/* -------------------------------------------------------------------------- */

export type ParentAuthState = {
  hasPasscode: boolean;
  unlocked: boolean;
  supported: boolean;
};

export const SERVER_PARENT_AUTH: ParentAuthState = {
  hasPasscode: false,
  unlocked: false,
  supported: false,
};

let cachedAuth: ParentAuthState | null = null;

type ParentAuthListener = () => void;
const parentAuthListeners = new Set<ParentAuthListener>();

export function subscribeParentAuth(listener: ParentAuthListener): () => void {
  parentAuthListeners.add(listener);
  return () => {
    parentAuthListeners.delete(listener);
  };
}

function emitParentAuthChange(): void {
  cachedAuth = null;
  for (const listener of parentAuthListeners) listener();
}

/** Invalida la instantanea tras un cambio externo (limpieza de datos). */
export function notifyParentAuthChange(): void {
  emitParentAuthChange();
}

/** Instantanea estable (misma referencia mientras no cambie el estado). */
export function getParentAuthSnapshot(): ParentAuthState {
  if (cachedAuth === null) {
    cachedAuth = {
      hasPasscode: hasPasscode(),
      unlocked: hasParentUnlock(),
      supported: isPasscodeSupported(),
    };
  }
  return cachedAuth;
}
