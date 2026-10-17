import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { ProfileManager } from "@/features/profile/components/profile-manager";

export const metadata: Metadata = {
  title: "Perfiles",
};

export default function ProfilesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfiles de este dispositivo"
        subtitle="Crea, elige o edita un perfil. Cada uno guarda su propio progreso por separado."
      />
      <ProfileManager />
    </div>
  );
}
