import type { Metadata } from "next";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Sin conexion",
};

export default function OfflinePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Parece que no hay conexion"
        subtitle="Algunas partes del juego necesitan internet. Otras, como repasar tus palabras, siguen funcionando."
      />

      <EmptyState
        icon="wifiOff"
        title="No pudimos conectar"
        description="Revisa la conexion a internet y vuelve a intentarlo. Tu progreso guardado no se pierde."
        action={
          <LinkButton href="/" icon="home">
            Volver al inicio
          </LinkButton>
        }
      />

      <Card className="space-y-2">
        <h2 className="text-cream-900 text-lg font-extrabold">Mientras tanto</h2>
        <ul className="text-cream-700 list-inside list-disc space-y-1 text-sm leading-relaxed">
          <li>Comprueba que el Wi-Fi o los datos moviles esten encendidos.</li>
          <li>Intenta abrir otra pagina para confirmar que hay internet.</li>
          <li>Vuelve a esta aplicacion en un momento y todo seguira donde lo dejaste.</li>
        </ul>
      </Card>
    </div>
  );
}
