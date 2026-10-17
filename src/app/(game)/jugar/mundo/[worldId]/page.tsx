import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { getWorld } from "@/content";
import { WorldDetail } from "@/features/worlds/components/world-detail";

type PageProps = {
  params: Promise<{ worldId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { worldId } = await params;
  const world = getWorld(worldId);
  return { title: world ? world.title.es : "Mundo no encontrado" };
}

export default async function WorldPage({ params }: PageProps) {
  const { worldId } = await params;
  const world = getWorld(worldId);
  if (!world) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Mundo ${world.order}`}
        title={world.title.es}
        subtitle={world.description.es}
        actions={
          <LinkButton href="/jugar/mapa" variant="secondary" icon="map">
            Volver al mapa
          </LinkButton>
        }
      />
      <WorldDetail worldId={world.id} />
    </div>
  );
}
