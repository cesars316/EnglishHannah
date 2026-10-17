import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { CollectionView } from "@/features/collection/components/collection-view";

export const metadata: Metadata = {
  title: "Mi coleccion",
};

export default function CollectionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Recompensas"
        title="Mi coleccion"
        subtitle="Tus insignias, tus monedas y las palabras que ya practicaste."
      />
      <CollectionView />
    </div>
  );
}
