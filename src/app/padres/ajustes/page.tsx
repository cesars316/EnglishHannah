import type { Metadata } from "next";

import { LinkButton } from "@/components/ui/link-button";
import { ParentGate } from "@/features/parent/components/parent-gate";
import { ParentSettings } from "@/features/parent/components/parent-settings";

export const metadata: Metadata = {
  title: "Ajustes y datos",
  robots: { index: false, follow: false, nocache: true },
};

export default function ParentSettingsPage() {
  return (
    <div className="space-y-6">
      <ParentGate>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-cream-900 text-2xl font-extrabold">Ajustes y datos</h1>
            <p className="text-cream-700 text-sm">
              Cambia el codigo de adulto, descarga una copia o borra los datos del dispositivo.
            </p>
          </div>
          <LinkButton href="/padres" variant="secondary" icon="chart">
            Ver el progreso
          </LinkButton>
        </div>

        <ParentSettings />
      </ParentGate>
    </div>
  );
}
