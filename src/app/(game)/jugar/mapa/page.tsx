import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { WorldMap } from "@/features/worlds/components/world-map";

export const metadata: Metadata = {
  title: "Mapa de mundos",
};

export default function MapPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="La ruta"
        title="Mapa de mundos"
        subtitle="Cada mundo se abre al completar el anterior. Elige uno disponible y empieza tu mision."
      />
      <WorldMap />
    </div>
  );
}
