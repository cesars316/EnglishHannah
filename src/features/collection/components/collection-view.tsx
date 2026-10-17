"use client";

import { useMemo } from "react";

import { VocabularyVisualView } from "@/components/activities/vocabulary-visual";
import { AvatarIllustration } from "@/components/ui/avatar-illustration";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { LinkButton } from "@/components/ui/link-button";
import { Mascot } from "@/components/ui/mascot";
import { Pill } from "@/components/ui/pill";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";
import { getAvatar } from "@/config/avatars";
import { ALL_VOCABULARY, BADGES } from "@/content";
import { useGameState } from "@/features/progress/use-game-state";
import { useProgressSummary } from "@/features/progress/use-progress-summary";
import { useProfiles } from "@/features/profile/profile-context";
import { cn } from "@/lib/cn";
import type { MasteryStatus } from "@/types/domain";

const STATUS_LABEL: Record<MasteryStatus, string> = {
  new: "Nueva",
  learning: "Aprendiendo",
  practicing: "Practicando",
  review: "Para repasar",
  mastered: "Dominada",
};

/**
 * "Mi coleccion": avatar, recompensas, insignias y el estado de cada palabra.
 *
 * El estado de dominio es una estimacion pedagogica, no una nota (seccion 6.2).
 */
export function CollectionView() {
  const { ready, activeProfile } = useProfiles();
  const gameState = useGameState(activeProfile?.id ?? null);
  const summary = useProgressSummary(activeProfile?.id ?? null);

  const vocabularyProgress = useMemo(() => {
    const map: Record<string, MasteryStatus> = {};
    for (const record of summary?.vocabulary ?? []) {
      map[record.entityId] = record.status;
    }
    return map;
  }, [summary]);

  if (!ready) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner size={28} label="Preparando tu coleccion" />
      </div>
    );
  }

  if (!activeProfile) {
    return (
      <EmptyState
        icon="user"
        title="Elige un perfil para ver tu coleccion"
        description="Cada perfil guarda sus propias insignias y palabras."
        action={
          <LinkButton href="/perfiles" icon="user">
            Elegir perfil
          </LinkButton>
        }
      />
    );
  }

  const avatar = getAvatar(activeProfile.avatarId);
  const earned = new Set(gameState.earnedBadgeIds);

  return (
    <div className="space-y-5">
      <Card tone="warm" className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <AvatarIllustration avatar={avatar} size={88} />
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-cream-900 text-2xl font-extrabold">{activeProfile.displayName}</h2>
            <p className="text-cream-700 text-sm font-semibold">Avatar: {avatar.label}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Pill tone="brand" icon={<Icon name="star" size={16} />}>
                {gameState.xp} XP
              </Pill>
              <Pill tone="warning" icon={<Icon name="coin" size={16} />}>
                {gameState.coins} monedas
              </Pill>
              <Pill tone="success">
                {gameState.completedLessonIds.length} lecciones completadas
              </Pill>
            </div>
          </div>
          <LinkButton href="/perfiles" variant="secondary" icon="pencil">
            Editar perfil
          </LinkButton>
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="text-cream-900 text-lg font-extrabold">Insignias</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BADGES.map((badge) => {
            const unlocked = earned.has(badge.id);
            return (
              <Card
                as="li"
                key={badge.id}
                tone={unlocked ? "success" : "muted"}
                className={cn("flex items-start gap-3", !unlocked && "opacity-80")}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-2xl text-2xl",
                    unlocked ? "bg-white shadow-sm" : "bg-cream-200 grayscale",
                  )}
                >
                  {unlocked ? (
                    badge.emoji
                  ) : (
                    <Icon name="lock" size={22} className="text-cream-700" />
                  )}
                </span>
                <div className="min-w-0 space-y-1">
                  <p className="text-cream-900 font-extrabold">{badge.title.es}</p>
                  <p className="text-cream-700 text-sm leading-relaxed">{badge.description.es}</p>
                  <Pill tone={unlocked ? "success" : "neutral"}>
                    {unlocked ? "Conseguida" : "Pendiente"}
                  </Pill>
                </div>
              </Card>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-cream-900 text-lg font-extrabold">Mi vocabulario</h2>
          {summary && (
            <Pill tone="sky">
              {summary.vocabularyMastered} dominadas de {ALL_VOCABULARY.length}
            </Pill>
          )}
        </div>

        {summary && summary.vocabularySeen > 0 && (
          <ProgressBar
            value={summary.vocabularyMastered}
            max={ALL_VOCABULARY.length}
            label="Palabras dominadas"
            hint={`${summary.vocabularyMastered} de ${ALL_VOCABULARY.length}`}
            tone="success"
          />
        )}

        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_VOCABULARY.map((item) => {
            const status: MasteryStatus = vocabularyProgress[item.id] ?? "new";
            return (
              <li
                key={item.id}
                className="border-cream-200 flex items-center gap-3 rounded-2xl border bg-white p-2.5"
              >
                <VocabularyVisualView visual={item.visual} size="sm" decorative />
                <div className="min-w-0 flex-1">
                  <p className="text-cream-900 truncate font-bold">{item.word}</p>
                  <p className="text-cream-600 truncate text-sm">{item.translation}</p>
                </div>
                <Pill
                  tone={
                    status === "mastered" ? "success" : status === "review" ? "warning" : "neutral"
                  }
                >
                  {STATUS_LABEL[status]}
                </Pill>
              </li>
            );
          })}
        </ul>
      </section>

      <Card className="flex items-start gap-3" tone="cool">
        <Mascot name="bloop" mood="happy" size={56} />
        <div className="space-y-1">
          <p className="text-cream-900 font-extrabold">Colecciona a tu ritmo</p>
          <p className="text-cream-700 text-sm leading-relaxed">
            Repetir una palabra nunca resta: cada intento la acerca un poco mas al dominio. No hay
            rachas que perder ni tiempo limite.
          </p>
        </div>
      </Card>
    </div>
  );
}
