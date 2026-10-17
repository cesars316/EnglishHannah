"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  /** Texto para lectores de pantalla cuando el icono va solo. */
  description: string;
};

export const MAIN_NAV: readonly NavItem[] = [
  { href: "/jugar", label: "Inicio", icon: "home", description: "Mision recomendada y progreso" },
  { href: "/jugar/mapa", label: "Mapa", icon: "map", description: "Mapa de mundos" },
  { href: "/jugar/practicar", label: "Jugar", icon: "play", description: "Actividades y repaso" },
  { href: "/coleccion", label: "Mi coleccion", icon: "trophy", description: "Insignias y avatar" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/jugar") return pathname === "/jugar";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function GameNavDesktop() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegacion principal" className="flex flex-col gap-1">
      {MAIN_NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-12 items-center gap-3 rounded-2xl px-4 py-2 font-bold transition",
              active ? "bg-brand-700 text-white shadow-sm" : "text-cream-800 hover:bg-cream-100",
            )}
          >
            <Icon name={item.icon} size={22} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function GameNavMobile() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegacion principal"
      className="border-cream-200 fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-2xl items-stretch justify-between px-2 py-1">
        {MAIN_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[0.7rem] font-bold transition",
                  active ? "text-brand-800" : "text-cream-700 hover:text-cream-900",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full",
                    active ? "bg-brand-100" : "bg-transparent",
                  )}
                >
                  <Icon name={item.icon} size={22} />
                </span>
                <span className="leading-tight">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
