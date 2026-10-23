import { describe, expect, it } from "vitest";

import { AVATARS, DEFAULT_AVATAR_ID, getAvatar } from "@/config/avatars";

/**
 * Los avatares son parte del contenido original: se dibujan con SVG propio y
 * cada identificador debe existir en la lista. El perfil guarda solo el `id`,
 * asi que un avatar que falte aqui se veria como el primero de la lista.
 */
describe("avatares", () => {
  it("no repite identificadores", () => {
    const ids = AVATARS.map((avatar) => avatar.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("el avatar por defecto esta en la lista", () => {
    expect(AVATARS.some((avatar) => avatar.id === DEFAULT_AVATAR_ID)).toBe(true);
  });

  it("todos tienen etiqueta, emoji y colores propios", () => {
    for (const avatar of AVATARS) {
      expect(avatar.label.length).toBeGreaterThan(0);
      expect(avatar.emoji.length).toBeGreaterThan(0);
      expect(avatar.primary).toMatch(/^#[0-9a-f]{6}$/i);
      expect(avatar.soft).toMatch(/^#[0-9a-f]{6}$/i);
      expect(avatar.primary).not.toBe(avatar.soft);
    }
  });

  it("incluye el unicornio sonador", () => {
    expect(AVATARS.some((avatar) => avatar.id === "unicorn-dreamer")).toBe(true);
  });

  it("getAvatar devuelve el avatar pedido o el primero si no existe", () => {
    expect(getAvatar("unicorn-dreamer").label).toBe("Unicornio sonador");
    expect(getAvatar("no-existe").id).toBe(AVATARS[0]?.id);
  });
});
