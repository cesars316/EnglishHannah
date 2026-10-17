import { describe, expect, it } from "vitest";

import { matchesAny, normalizeAnswer } from "@/lib/normalize";

/**
 * La normalizacion es la base de la correccion de texto: si cambia, cambia lo
 * que el juego acepta como respuesta correcta.
 */
describe("normalizeAnswer", () => {
  it("ignora mayusculas y espacios sobrantes", () => {
    expect(normalizeAnswer("  Hello   World ")).toBe("hello world");
  });

  it("quita acentos y signos", () => {
    expect(normalizeAnswer("¡Hólá, niño!")).toBe("hola nino");
  });

  it("unifica apostrofos tipograficos", () => {
    expect(normalizeAnswer("It’s")).toBe("it's");
    expect(normalizeAnswer("It’s")).toBe(normalizeAnswer("it's"));
  });

  it("no borra los apostrofos al normalizar", () => {
    expect(normalizeAnswer("I'm fine")).toBe("i'm fine");
  });

  it("devuelve cadena vacia para entradas sin letras ni numeros", () => {
    expect(normalizeAnswer("!!!")).toBe("");
  });
});

describe("matchesAny", () => {
  it("encuentra coincidencias sin importar el formato", () => {
    expect(matchesAny("Thank you!", ["thank-you", "thank you"])).toBe(true);
  });

  it("rechaza respuestas vacias aunque la lista este vacia o no coincida", () => {
    expect(matchesAny("", ["hello"])).toBe(false);
    expect(matchesAny("bye", ["hello"])).toBe(false);
  });
});
