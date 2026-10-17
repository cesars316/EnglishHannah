"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Pill } from "@/components/ui/pill";
import { Spinner } from "@/components/ui/spinner";
import { StatusMessage } from "@/components/ui/status-message";
import { getWorld } from "@/content";
import { formatDateTime } from "@/lib/format";
import { persistReducedMotionPreference } from "@/components/layout/motion-preference";
import { useProgressSummary } from "@/features/progress/use-progress-summary";
import { useProfiles } from "@/features/profile/profile-context";
import { cn } from "@/lib/cn";
import type { Skill } from "@/types/content";

const SKILL_LABEL: Record<Skill, string> = {
  listening: "Escuchar",
  reading: "Leer",
  vocabulary: "Vocabulario",
  speaking: "Hablar",
  writing: "Escribir",
};

function StatCard({
  icon,
  label,
  value,
}: {
  icon: "star" | "coin" | "book" | "globe";
  label: string;
  value: string;
}) {
  return (
    <Card className="space-y-1">
      <p className="text-cream-700 flex items-center gap-2 text-sm font-bold">
        <Icon name={icon} size={18} className="text-brand-600" />
        {label}
      </p>
      <p className="text-cream-900 text-2xl font-extrabold">{value}</p>
    </Card>
  );
}

function Toggle({
  id,
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="border-cream-200 flex items-start justify-between gap-4 border-b py-3 last:border-b-0">
      <div className="min-w-0 space-y-0.5">
        <label htmlFor={id} className="text-cream-900 block font-bold">
          {label}
        </label>
        <p className="text-cream-700 text-sm leading-relaxed">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-1 h-8 w-14 shrink-0 rounded-full border-2 transition",
          checked ? "border-success-500 bg-success-500" : "border-cream-300 bg-cream-200",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-0.5 size-6 rounded-full bg-white shadow-sm transition-all",
            checked ? "left-6" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

/**
 * Panel para padres o tutores: progreso real, sin juicios ni notas.
 *
 * Todo lo que se muestra sale del dispositivo; no hay datos de seguimiento ni
 * comparaciones con otros niños.
 */
export function ParentDashboard() {
  const { ready, profiles, activeProfile, updateProfile } = useProfiles();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const effectiveId = selectedId ?? activeProfile?.id ?? profiles[0]?.id ?? null;
  const summary = useProgressSummary(effectiveId);
  const selectedProfile = profiles.find((profile) => profile.id === effectiveId) ?? null;

  if (!ready) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner size={28} label="Cargando el progreso" />
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <EmptyState
        icon="user"
        title="Todavia no hay perfiles"
        description="Cuando se cree un perfil infantil, aqui aparecera su progreso."
      />
    );
  }

  const isActiveProfile = selectedProfile?.id === activeProfile?.id;

  return (
    <div className="space-y-5">
      <Card className="space-y-3">
        <label htmlFor="parent-profile" className="text-cream-800 block text-sm font-bold">
          Perfil que quieres revisar
        </label>
        <select
          id="parent-profile"
          value={effectiveId ?? ""}
          onChange={(event) => setSelectedId(event.target.value)}
          className="border-cream-300 text-cream-900 min-h-12 w-full max-w-sm rounded-xl border-2 bg-white px-4 text-base font-semibold outline-none focus:border-sky-500"
        >
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.displayName}
              {profile.id === activeProfile?.id ? " (activo)" : ""}
            </option>
          ))}
        </select>
      </Card>

      {summary && selectedProfile && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon="star" label="Experiencia" value={`${summary.xp} XP`} />
            <StatCard icon="coin" label="Monedas" value={`${summary.coins}`} />
            <StatCard icon="book" label="Actividades" value={`${summary.activitiesCompleted}`} />
            <StatCard
              icon="globe"
              label="Tiempo de practica"
              value={`${summary.minutesPracticed} min`}
            />
          </div>

          <Card className="space-y-3">
            <h2 className="text-cream-900 text-lg font-extrabold">Palabras y mundos</h2>
            <div className="flex flex-wrap gap-2">
              <Pill tone="sky">{summary.vocabularySeen} palabras practicadas</Pill>
              <Pill tone="success">{summary.vocabularyMastered} palabras dominadas</Pill>
              <Pill tone="neutral">{summary.worldsVisited} mundos visitados</Pill>
              <Pill tone="brand">{summary.worldsCompleted} mundos completados</Pill>
            </div>
            <p className="text-cream-700 text-sm leading-relaxed">
              El «dominio» es una estimacion: sube al acertar en varias sesiones y con distintos
              tipos de actividad. No es una nota ni una comparacion con otros niños.
            </p>
          </Card>

          <Card className="space-y-3">
            <h2 className="text-cream-900 text-lg font-extrabold">Practica por habilidad</h2>
            <ul className="space-y-2">
              {(Object.keys(SKILL_LABEL) as Skill[]).map((skill) => {
                const stats = summary.bySkill[skill];
                const percent =
                  stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
                return (
                  <li key={skill} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-cream-900 font-bold">{SKILL_LABEL[skill]}</span>
                      <span className="text-cream-700">
                        {stats.correct} de {stats.attempts} aciertos
                      </span>
                    </div>
                    <div className="bg-cream-200 h-2.5 w-full overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{ width: `${percent}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          {summary.reviewSuggestions.length > 0 && (
            <Card className="space-y-3" tone="cool">
              <h2 className="text-cream-900 text-lg font-extrabold">
                Palabras que conviene repasar
              </h2>
              <ul className="space-y-1.5">
                {summary.reviewSuggestions.map((suggestion) => (
                  <li
                    key={suggestion.entityId}
                    className="flex flex-wrap items-center gap-2 text-sm"
                  >
                    <span className="text-cream-900 font-bold">{suggestion.word}</span>
                    <span className="text-cream-600">({suggestion.translation})</span>
                    <Pill tone={suggestion.status === "review" ? "warning" : "neutral"}>
                      {suggestion.status === "review" ? "Necesita repaso" : "En practica"}
                    </Pill>
                  </li>
                ))}
              </ul>
              <p className="text-cream-700 text-sm">
                En el juego aparecen en la seccion «Repaso», sin penalizaciones.
              </p>
            </Card>
          )}

          <Card className="space-y-3">
            <h2 className="text-cream-900 text-lg font-extrabold">Ultimas actividades</h2>
            {summary.recentActivity.length === 0 ? (
              <p className="text-cream-700 text-sm">Todavia no hay actividad registrada.</p>
            ) : (
              <ul className="space-y-2">
                {summary.recentActivity.map((activity) => (
                  <li
                    key={`${activity.activityId}-${activity.createdAt}`}
                    className="flex flex-wrap items-center gap-2 text-sm"
                  >
                    <span className="text-cream-900 font-bold">
                      {getWorld(activity.worldId)?.title.es ?? activity.worldId}
                    </span>
                    <span className="text-cream-600">{SKILL_LABEL[activity.skill]}</span>
                    <Pill
                      tone={
                        activity.result === "correct"
                          ? "success"
                          : activity.result === "incorrect"
                            ? "warning"
                            : "sky"
                      }
                    >
                      {activity.result === "correct"
                        ? "Acertada"
                        : activity.result === "incorrect"
                          ? "Fallada"
                          : "Completada"}
                    </Pill>
                    <span className="text-cream-600">{formatDateTime(activity.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}

      {selectedProfile && isActiveProfile && (
        <Card className="space-y-1">
          <h2 className="text-cream-900 text-lg font-extrabold">
            Ajustes de {selectedProfile.displayName}
          </h2>
          <Toggle
            id="setting-sound"
            label="Sonido del juego"
            description="Efectos y locucion de las actividades."
            checked={selectedProfile.settings.soundEnabled}
            onChange={(value) =>
              updateProfile(selectedProfile.id, { settings: { soundEnabled: value } })
            }
          />
          <Toggle
            id="setting-microphone"
            label="Microfono"
            description="Permite practicar la pronunciacion. Si esta apagado, las actividades de voz se hacen sin microfono."
            checked={selectedProfile.settings.microphoneEnabled}
            onChange={(value) =>
              updateProfile(selectedProfile.id, { settings: { microphoneEnabled: value } })
            }
          />
          <Toggle
            id="setting-camera"
            label="Camara"
            description="Solo para retos de buscar objetos. Nunca se guardan fotos ni video."
            checked={selectedProfile.settings.cameraEnabled}
            onChange={(value) =>
              updateProfile(selectedProfile.id, { settings: { cameraEnabled: value } })
            }
          />
          <Toggle
            id="setting-motion"
            label="Reducir animaciones"
            description="Menos movimiento en pantalla, util si las animaciones cansan."
            checked={selectedProfile.settings.reducedMotion}
            onChange={(value) => {
              persistReducedMotionPreference(value);
              updateProfile(selectedProfile.id, { settings: { reducedMotion: value } });
            }}
          />
        </Card>
      )}

      {selectedProfile && !isActiveProfile && (
        <StatusMessage tone="info" title="Ajustes del perfil activo">
          <p>
            Los ajustes se cambian en el perfil que esta activo. Elige{" "}
            <strong>{selectedProfile.displayName}</strong> como perfil activo para modificarlos.
          </p>
        </StatusMessage>
      )}
    </div>
  );
}
