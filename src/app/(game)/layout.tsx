import { AppShell } from "@/components/layout/app-shell";

/** Cascaron de la zona de juego (perfil, recompensas y navegacion). */
export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
