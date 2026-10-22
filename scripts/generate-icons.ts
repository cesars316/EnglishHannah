/**
 * Genera los iconos PNG de la PWA a partir de los SVG del repositorio.
 *
 * Los SVG (`public/images/icon.svg` y `icon-maskable.svg`) son la fuente de
 * verdad: aqui solo se rasterizan a los tamanos que exigen los manifiestos y
 * los dispositivos (Android/iOS/escritorio). Asi no se guardan binarios
 * dibujados a mano y los iconos se pueden regenerar en cualquier momento.
 *
 * Es idempotente: ejecutarlo de nuevo reescribe los mismos PNG.
 *
 * Uso: `npm run icons` (no necesita base de datos).
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";

const PUBLIC_DIR = join(process.cwd(), "public");
const PUBLIC_IMAGES = join(PUBLIC_DIR, "images");

/** Variante normal (Pip con esquinas redondeadas) y variante maskable. */
const SOURCES = {
  standard: { file: "icon.svg", label: "icono estandar" },
  maskable: { file: "icon-maskable.svg", label: "icono maskable" },
} as const;

type SourceKey = keyof typeof SOURCES;

type Target = {
  /** Ruta de salida relativa a `public/`. */
  file: string;
  /** Lado del cuadrado en pixeles. */
  size: number;
  /** SVG de origen dentro de `public/images/`. */
  source: SourceKey;
};

/**
 * Tamanos publicados en el manifiesto y en el HTML:
 * - 192/512: los que pide la especificacion de manifiestos.
 * - 180: `apple-touch-icon` (iPhone/iPad, no admite SVG).
 * - 32: `favicon` clasico para pestañas de escritorio.
 *
 * `apple-touch-icon.png` vive en la raiz de `public/`: iOS lo busca ahi o en
 * el `<link rel="apple-touch-icon">` del HTML.
 */
const TARGETS: readonly Target[] = [
  { file: "images/icon-192.png", size: 192, source: "standard" },
  { file: "images/icon-512.png", size: 512, source: "standard" },
  { file: "images/icon-maskable-512.png", size: 512, source: "maskable" },
  { file: "apple-touch-icon.png", size: 180, source: "standard" },
  { file: "favicon-32.png", size: 32, source: "standard" },
];

async function render(target: Target): Promise<number> {
  const source = SOURCES[target.source];
  const svg = await readFile(join(PUBLIC_IMAGES, source.file));

  const png = await sharp(svg, { density: 384 })
    .resize(target.size, target.size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer();

  await writeFile(join(PUBLIC_DIR, target.file), png);
  return png.byteLength;
}

async function main(): Promise<void> {
  console.log("English Quest - generacion de iconos");
  console.log(`Origen: public/images/${SOURCES.standard.file} y ${SOURCES.maskable.file}`);
  console.log("");

  for (const target of TARGETS) {
    const bytes = await render(target);
    console.log(
      ` - ${target.file} (${target.size}x${target.size}, ${SOURCES[target.source].label}, ${Math.round(bytes / 1024)} KB)`,
    );
  }

  console.log("");
  console.log("Listo.");
}

main().catch((error: unknown) => {
  console.error("No se pudieron generar los iconos:", error);
  process.exitCode = 1;
});
