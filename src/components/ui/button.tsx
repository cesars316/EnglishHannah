import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "playful";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Todos los tamaños respetan objetivos tactiles de al menos 44 px de alto.
 * `loading` bloquea el doble envio (documento maestro, seccion 4.4).
 */
const BASE =
  "inline-flex select-none items-center justify-center gap-2 text-center font-bold transition " +
  "duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55 " +
  "disabled:active:translate-y-0";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand-700 text-white shadow-sm hover:bg-brand-800",
  secondary:
    "border-2 border-cream-300 bg-white text-cream-900 hover:border-brand-400 hover:bg-brand-50",
  ghost: "bg-transparent text-cream-800 hover:bg-cream-100",
  danger: "bg-danger-700 text-white hover:bg-danger-600",
  success: "bg-success-700 text-white hover:bg-success-500",
  playful: "bg-sky-700 text-white shadow-sm hover:bg-sky-800",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "min-h-11 rounded-xl px-4 text-sm",
  md: "min-h-12 rounded-2xl px-5 text-base",
  lg: "min-h-14 rounded-2xl px-7 text-lg",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconEnd?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
};

export type ButtonProps = CommonProps & Omit<ComponentPropsWithoutRef<"button">, "children">;

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className);
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconEnd,
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled === true || loading;

  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, fullWidth, className })}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Spinner size={size === "sm" ? 16 : 20} label="Cargando" />
      ) : (
        icon && <Icon name={icon} size={size === "sm" ? 18 : size === "lg" ? 26 : 22} />
      )}
      {children !== undefined && children !== null && <span>{children}</span>}
      {iconEnd && !loading && (
        <Icon name={iconEnd} size={size === "sm" ? 18 : size === "lg" ? 26 : 22} />
      )}
    </button>
  );
}
