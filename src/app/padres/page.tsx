import type { Metadata } from "next";

import { LinkButton } from "@/components/ui/link-button";
import { ParentDashboard } from "@/features/parent/components/parent-dashboard";
import { ParentGate } from "@/features/parent/components/parent-gate";

export const metadata: Metadata = {
  title: "Progreso",
  robots: { index: false, follow: false, nocache: true },
};

export default function ParentHomePage() {
  return (
    <div className="space-y-6">
      <ParentGate>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-cream-900 text-2xl font-extrabold">Progreso de cada niño</h1>
            <p className="text-cream-700 text-sm">
              Datos guardados en este dispositivo. Sin notas ni comparaciones.
            </p>
          </div>
          <LinkButton href="/padres/ajustes" variant="secondary" icon="settings">
            Ajustes y datos
          </LinkButton>
        </div>

        <ParentDashboard />
      </ParentGate>
    </div>
  );
}
