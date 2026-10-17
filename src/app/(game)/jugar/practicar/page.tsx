import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { ReviewSession } from "@/features/progress/components/review-session";

export const metadata: Metadata = {
  title: "Repaso",
};

export default function PracticePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Repaso"
        title="Practicar palabras"
        subtitle="Una sesion corta con las palabras que conviene recordar. Repetir siempre suma."
      />
      <ReviewSession />
    </div>
  );
}
