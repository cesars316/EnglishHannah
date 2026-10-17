import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import { COOKIE_MAX_AGE_SECONDS, COOKIES } from "@/config/game";
import { isAuthConfigured } from "@/server/env";
import { apiError } from "@/server/http/errors";
import { cookies } from "next/headers";

/**
 * Identidad del dispositivo/adulto y autorizacion de la zona parental.
 *
 * - La cookie `eq_session` guarda `ownerId.firma` (HMAC-SHA256). El servidor
 *   NUNCA acepta un `ownerId` enviado por el navegador: lo deduce de la cookie
 *   firmada (ADR 0003).
 * - La cookie `eq_parent` es una firma con proposito distinto y caducidad corta
 *   (30 minutos) que autoriza las acciones sensibles.
 */

const SEPARATOR = ".";
const SESSION_SCOPE = "session";
const PARENT_SCOPE = "parent";

let ephemeralSecret: string | null = null;

function signingSecret(): string {
  if (isAuthConfigured()) return process.env.AUTH_SECRET ?? "";
  // Comodidad de desarrollo: si falta AUTH_SECRET se usa un secreto efimero.
  // Las sesiones dejan de ser validas al reiniciar, pero la app no se rompe.
  if (!ephemeralSecret) {
    ephemeralSecret = randomUUID();
    console.warn(
      "[auth] AUTH_SECRET no esta definida: se usa un secreto temporal. " +
        "Define AUTH_SECRET en .env.local para conservar las sesiones.",
    );
  }
  return ephemeralSecret;
}

function signValue(payload: string, scope: string): string {
  return createHmac("sha256", `${scope}:${signingSecret()}`).update(payload).digest("base64url");
}

export function signValueFor(payload: string, scope: string): string {
  return `${payload}${SEPARATOR}${signValue(payload, scope)}`;
}

export function verifySignedValue(value: string | undefined, scope: string): string | null {
  if (!value) return null;
  const index = value.lastIndexOf(SEPARATOR);
  if (index <= 0 || index === value.length - 1) return null;

  const payload = value.slice(0, index);
  const provided = value.slice(index + 1);
  const expected = signValue(payload, scope);

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) return null;
  return timingSafeEqual(providedBuffer, expectedBuffer) ? payload : null;
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

/* -------------------------------------------------------------------------- */
/* Sesion de dispositivo                                                       */
/* -------------------------------------------------------------------------- */

/** `ownerId` de la sesion, o `null` si la cookie falta o no es valida. */
export async function readOwnerId(): Promise<string | null> {
  const store = await cookies();
  return verifySignedValue(store.get(COOKIES.session)?.value, SESSION_SCOPE);
}

/** Exige una sesion valida. */
export async function requireOwnerId(): Promise<string> {
  const ownerId = await readOwnerId();
  if (!ownerId) throw apiError.unauthorized();
  return ownerId;
}

/**
 * Devuelve el `ownerId` de la sesion y, si no existe, crea uno nuevo y emite la
 * cookie. Solo puede llamarse desde un Route Handler o una Server Action.
 */
export async function ensureOwnerId(): Promise<string> {
  const existing = await readOwnerId();
  if (existing) return existing;

  const ownerId = randomUUID();
  const store = await cookies();
  store.set(
    COOKIES.session,
    signValueFor(ownerId, SESSION_SCOPE),
    cookieOptions(COOKIE_MAX_AGE_SECONDS.session),
  );
  return ownerId;
}

/* -------------------------------------------------------------------------- */
/* Autorizacion parental                                                       */
/* -------------------------------------------------------------------------- */

/** `true` si la zona parental esta desbloqueada para esta sesion. */
export async function isParentUnlocked(ownerId: string): Promise<boolean> {
  const store = await cookies();
  const payload = verifySignedValue(store.get(COOKIES.parent)?.value, PARENT_SCOPE);
  return payload === ownerId;
}

/** Exige la zona parental desbloqueada. */
export async function requireParentUnlocked(ownerId: string): Promise<void> {
  if (!(await isParentUnlocked(ownerId))) throw apiError.parentRequired();
}

export async function grantParentUnlock(ownerId: string): Promise<void> {
  const store = await cookies();
  store.set(
    COOKIES.parent,
    signValueFor(ownerId, PARENT_SCOPE),
    cookieOptions(COOKIE_MAX_AGE_SECONDS.parent),
  );
}

export async function revokeParentUnlock(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIES.parent);
}
