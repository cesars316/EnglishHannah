import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { HomeDashboard } from "@/features/progress/components/home-dashboard";

export const metadata: Metadata = {
  title: "Inicio",
};

export default function PlayHomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tu aventura"
        title="¿Que toca hoy?"
        subtitle="Elige seguir con tu mision, repasar palabras o ver tu coleccion."
      />
      <HomeDashboard />
    </div>
  );
}
