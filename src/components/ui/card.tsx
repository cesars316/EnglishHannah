import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type CardProps = {
  children: ReactNode;
  className?: string;
  /** Tono suave de fondo para diferenciar secciones. */
  tone?: "default" | "warm" | "cool" | "success" | "muted";
  as?: "div" | "section" | "article" | "li";
};

const TONES = {
  default: "bg-white border-cream-200",
  warm: "bg-brand-50 border-brand-100",
  cool: "bg-sky-50 border-sky-100",
  success: "bg-success-50 border-success-500/30",
  muted: "bg-cream-100 border-cream-200",
} as const;

export function Card({ children, className, tone = "default", as: Tag = "div" }: CardProps) {
  return (
    <Tag className={cn("rounded-card shadow-card border p-5", TONES[tone], className)}>
      {children}
    </Tag>
  );
}
