import Link from "next/link";
import type { ReactNode } from "react";

import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";

export type LinkButtonProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  fullWidth?: boolean;
  className?: string;
};

/**
 * Enlace con aspecto de boton.
 *
 * Existe para no anidar un `<button>` dentro de un `<a>` (HTML invalido y
 * problematico para lectores de pantalla): la navegacion siempre es un enlace.
 */
export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  icon,
  fullWidth = false,
  className,
}: LinkButtonProps) {
  return (
    <Link href={href} className={buttonClasses({ variant, size, fullWidth, className })}>
      {icon && <Icon name={icon} size={size === "sm" ? 18 : size === "lg" ? 26 : 22} />}
      <span>{children}</span>
    </Link>
  );
}
