/**
 * Validacion del contenido pedagogico.
 *
 * Ejecuta `npm run validate:content`. Falla (codigo de salida 1) si hay errores.
 * Los avisos no bloquean la compilacion, pero conviene revisarlos.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  ALL_ACTIVITIES,
  ALL_LESSONS,
  ALL_VOCABULARY,
  ALL_WORLDS,
  BADGES,
} from "../src/content/index";
import { summarizeIssues, validateContent, type ContentIssue } from "../src/content/validate";

const PUBLIC_DIR = join(process.cwd(), "public");

/**
 * Comprueba que un asset referenciado con ruta web (`/images/...`) existe en
 * `public/`. Se construye la ruta por segmentos para que funcione igual en
 * Windows y en Linux (el separador `\` rompia la validacion en CI).
 */
function fileExists(publicPath: string): boolean {
  const segments = publicPath.replace(/^\/+/, "").split("/").filter(Boolean);
  if (segments.length === 0) return false;
  return existsSync(join(PUBLIC_DIR, ...segments));
}

const FORMAT = {
  reset: "\u001b[0m",
  red: "\u001b[31m",
  yellow: "\u001b[33m",
  green: "\u001b[32m",
  dim: "\u001b[2m",
  bold: "\u001b[1m",
} as const;

function colorize(level: ContentIssue["level"], text: string): string {
  const prefix = level === "error" ? `${FORMAT.red}error` : `${FORMAT.yellow}aviso`;
  return `${prefix}${FORMAT.reset} ${text}`;
}

const issues = validateContent(
  {
    worlds: ALL_WORLDS,
    lessons: ALL_LESSONS,
    activities: ALL_ACTIVITIES,
    vocabulary: ALL_VOCABULARY,
    badges: BADGES,
  },
  { fileExists },
);

const { errors, warnings } = summarizeIssues(issues);

const activityCountByType = new Map<string, number>();
for (const activity of ALL_ACTIVITIES) {
  activityCountByType.set(activity.type, (activityCountByType.get(activity.type) ?? 0) + 1);
}

console.log(`${FORMAT.bold}English Quest - validacion de contenido${FORMAT.reset}`);
console.log(
  `${FORMAT.dim}${ALL_WORLDS.length} mundos | ${ALL_LESSONS.length} lecciones | ${ALL_ACTIVITIES.length} actividades | ${ALL_VOCABULARY.length} palabras | ${BADGES.length} insignias${FORMAT.reset}`,
);
console.log(
  `${FORMAT.dim}Tipos: ${[...activityCountByType.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, count]) => `${type}=${count}`)
    .join(", ")}${FORMAT.reset}`,
);
console.log("");

for (const issue of issues) {
  console.log(colorize(issue.level, `[${issue.code}] ${issue.message}`));
}

if (issues.length > 0) console.log("");

if (errors === 0) {
  console.log(
    `${FORMAT.green}Contenido valido${FORMAT.reset} (${warnings} aviso${warnings === 1 ? "" : "s"}).`,
  );
} else {
  console.log(
    `${FORMAT.red}${errors} error${errors === 1 ? "" : "es"} y ${warnings} aviso${warnings === 1 ? "" : "s"}.${FORMAT.reset}`,
  );
}

process.exit(errors === 0 ? 0 : 1);
