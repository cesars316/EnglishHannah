import type { Avatar } from "@/types/domain";

/**
 * Avatares originales. Se dibujan con SVG y CSS propios (sin recursos de
 * terceros y sin personajes reconocibles).
 */
export const AVATARS: readonly Avatar[] = [
  {
    id: "fox-explorer",
    label: "Zorra exploradora",
    emoji: "🦊",
    primary: "#ea5a28",
    soft: "#ffe3d3",
  },
  { id: "owl-scholar", label: "Buho sabio", emoji: "🦉", primary: "#0f5896", soft: "#dceefe" },
  { id: "cat-artist", label: "Gata artista", emoji: "🐱", primary: "#b23f6c", soft: "#fde8ef" },
  { id: "panda-pilot", label: "Panda piloto", emoji: "🐼", primary: "#5c4e3d", soft: "#f6e8d5" },
  {
    id: "dolphin-diver",
    label: "Delfin buceador",
    emoji: "🐬",
    primary: "#208be3",
    soft: "#dceefe",
  },
  {
    id: "bee-builder",
    label: "Abeja constructora",
    emoji: "🐝",
    primary: "#96660a",
    soft: "#fff3d6",
  },
  {
    id: "unicorn-dreamer",
    label: "Unicornio sonador",
    emoji: "🦄",
    primary: "#8e5bd8",
    soft: "#f3e9ff",
  },
] as const;

export const DEFAULT_AVATAR_ID = "fox-explorer";

export function getAvatar(avatarId: string): Avatar {
  return AVATARS.find((avatar) => avatar.id === avatarId) ?? (AVATARS[0] as Avatar);
}
