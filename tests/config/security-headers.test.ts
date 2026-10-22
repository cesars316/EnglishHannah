import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";

/**
 * Las cabeceras de seguridad no tienen pruebas de navegador en CI, asi que se
 * comprueban aqui sobre la propia configuracion: es la unica forma de que un
 * cambio en `next.config.ts` no desactive la CSP sin que nadie lo note.
 */

type HeaderEntry = { key: string; value: string };

async function headersFor(source: string): Promise<Map<string, string>> {
  const rules = await nextConfig.headers?.();
  const rule = rules?.find((entry) => entry.source === source);
  if (!rule) throw new Error(`No hay reglas de cabeceras para "${source}".`);

  const map = new Map<string, string>();
  for (const header of rule.headers as HeaderEntry[]) {
    map.set(header.key.toLowerCase(), header.value);
  }
  return map;
}

/** Recupera una directiva concreta de la CSP ("script-src", "connect-src"...). */
function directive(csp: string, name: string): string | undefined {
  return csp
    .split(";")
    .map((part) => part.trim())
    .find((part) => part === name || part.startsWith(`${name} `));
}

describe("cabeceras de seguridad", () => {
  it("protege todas las rutas con las cabeceras base", async () => {
    const headers = await headersFor("/:path*");

    expect(headers.get("x-content-type-options")).toBe("nosniff");
    expect(headers.get("x-frame-options")).toBe("DENY");
    expect(headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("permissions-policy")).toContain("camera=(self)");
    expect(headers.get("permissions-policy")).toContain("microphone=(self)");
  });

  it("sirve una CSP y cierra los vectores de inyeccion", async () => {
    const csp = (await headersFor("/:path*")).get("content-security-policy");
    expect(csp).toBeTruthy();
    const value = csp ?? "";

    expect(directive(value, "default-src")).toBe("default-src 'self'");
    expect(directive(value, "object-src")).toBe("object-src 'none'");
    expect(directive(value, "base-uri")).toBe("base-uri 'self'");
    expect(directive(value, "frame-ancestors")).toBe("frame-ancestors 'none'");
    expect(directive(value, "form-action")).toBe("form-action 'self'");
  });

  it("no carga recursos de terceros", async () => {
    const csp = (await headersFor("/:path*")).get("content-security-policy") ?? "";

    for (const name of [
      "default-src",
      "script-src",
      "style-src",
      "img-src",
      "font-src",
      "connect-src",
    ]) {
      const value = directive(csp, name);
      expect(value, `falta la directiva ${name}`).toBeTruthy();
      expect(value).toContain("'self'");
      // Ningun origen externo con esquema http(s) absoluto.
      expect(value).not.toMatch(/https?:\/\/(?!localhost)/);
    }
  });
});
