import { randomUUID } from "node:crypto";

import { ALL_ACTIVITIES } from "@/content";
import { createProfileForOwner } from "@/server/use-cases/profiles";

import type {
  Activity,
  ActivityResponse,
  CameraHuntActivity,
  ImageChoiceActivity,
  ListenAndChooseActivity,
  SentenceCompletionActivity,
} from "@/types/content";
import type { Profile } from "@/types/domain";

export function newOwnerId(): string {
  return randomUUID();
}

export function newAttemptId(): string {
  return randomUUID();
}

export async function createTestProfile(ownerId: string): Promise<Profile> {
  return createProfileForOwner(ownerId, { displayName: "Nina" });
}

export type ChoiceActivity =
  | ListenAndChooseActivity
  | ImageChoiceActivity
  | SentenceCompletionActivity
  | CameraHuntActivity;

const CHOICE_TYPES = new Set([
  "listen-and-choose",
  "image-choice",
  "sentence-completion",
  "camera-hunt",
]);

export function findChoiceActivity(): ChoiceActivity {
  const activity = ALL_ACTIVITIES.find(
    (item): item is ChoiceActivity => CHOICE_TYPES.has(item.type),
  );
  if (!activity) throw new Error("El contenido no tiene actividades de eleccion.");
  return activity;
}

function optionIds(activity: ChoiceActivity): string[] {
  if (activity.type === "camera-hunt") return activity.content.fallbackOptions.map((o) => o.id);
  return activity.content.options.map((o) => o.id);
}

export function correctResponse(activity: Activity): ActivityResponse {
  switch (activity.type) {
    case "listen-and-choose":
    case "image-choice":
    case "sentence-completion":
    case "camera-hunt":
      return { kind: "choice", optionId: activity.answerKey.optionId };
    case "matching-pairs":
      return {
        kind: "pairs",
        pairs: activity.answerKey.pairs.map((pair) => ({
          leftId: pair.leftId,
          rightId: pair.rightId,
        })),
      };
    case "word-builder":
      return { kind: "text", text: activity.answerKey.text };
    case "speak-and-check":
      return {
        kind: "speech",
        transcript: activity.answerKey.acceptedAnswers[0] ?? activity.content.target,
      };
    case "story-quiz":
      return { kind: "self-report", practiced: true };
    default:
      return { kind: "self-report", practiced: true };
  }
}

export function wrongResponse(activity: ChoiceActivity): ActivityResponse {
  const wrong = optionIds(activity).find((id) => id !== activity.answerKey.optionId);
  return { kind: "choice", optionId: wrong ?? "__opcion_invalida__" };
}

export function createTestActivity(overrides?: Partial<ChoiceActivity>): ChoiceActivity {
  const base = findChoiceActivity();
  return { ...base, ...overrides } as ChoiceActivity;
}
