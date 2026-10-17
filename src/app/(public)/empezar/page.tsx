import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { StatusMessage } from "@/components/ui/status-message";
import { ProfileManager } from "@/features/profile/components/profile-manager";

export const metadata: Metadata = {
  title: "Empezar la aventura",
};

export default function StartPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Paso 1 de 2"
        title="Crea tu primer perfil"
        subtitle="Elige un nombre y un avatar. Tu progreso se guardara solo en este dispositivo."
      />

      <StatusMessage tone="info" title="Antes de empezar">
        <p>
          Puedes crear varios perfiles en el mismo dispositivo: uno por niño. Asi cada uno tiene sus
          propias estrellas, monedas e insignias.
        </p>
      </StatusMessage>

      <ProfileManager />
    </div>
  );
}
