import type { SVGProps } from "react";

import { cn } from "@/lib/cn";

/**
 * Iconos originales (trazos propios, sin recursos de terceros).
 * Todos heredan `currentColor` para adaptarse al contraste del contexto.
 */
export type IconName =
  | "home"
  | "map"
  | "play"
  | "trophy"
  | "speaker"
  | "speakerOff"
  | "mic"
  | "camera"
  | "check"
  | "close"
  | "arrowLeft"
  | "arrowRight"
  | "lock"
  | "user"
  | "settings"
  | "star"
  | "coin"
  | "sparkles"
  | "lightbulb"
  | "refresh"
  | "chart"
  | "book"
  | "globe"
  | "shield"
  | "wifiOff"
  | "clock"
  | "plus"
  | "target"
  | "pencil"
  | "trash"
  | "download";

type IconDefinition = {
  paths: string[];
  fill?: boolean;
};

const CIRCLE = (cx: number, cy: number, r: number): string =>
  `M${cx - r},${cy} a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 ${-r * 2},0`;

const ICONS: Record<IconName, IconDefinition> = {
  home: { paths: ["M3 10.5 12 3l9 7.5", "M5.5 9.6V20h13V9.6", "M10 20v-5h4v5"] },
  map: {
    paths: ["M3 6.5 8.5 4l7 2.5L21 4v13.5L15.5 20l-7-2.5L3 20z", "M8.5 4v13.5", "M15.5 6.5V20"],
  },
  play: { paths: ["M8.5 5.5 19 12 8.5 18.5z"], fill: true },
  trophy: {
    paths: ["M7 4h10v3.5a5 5 0 0 1-10 0z", "M12 12.5V16", "M8.5 20h7", "M9.5 16h5l1 4h-7z"],
  },
  speaker: {
    paths: [
      "M4 9.5h3L11 6v12l-4-3.5H4z",
      "M14.5 9.2a4 4 0 0 1 0 5.6",
      "M17 6.5a7.5 7.5 0 0 1 0 11",
    ],
  },
  speakerOff: { paths: ["M4 9.5h3L11 6v12l-4-3.5H4z", "M15 9.5l5 5", "M20 9.5l-5 5"] },
  mic: {
    paths: [
      "M12 3.5a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0v-5a3 3 0 0 1 3-3z",
      "M6 11a6 6 0 0 0 12 0",
      "M12 17v3.5",
      "M9 20.5h6",
    ],
  },
  camera: {
    paths: ["M4 8.5h3l1.6-2.2h6.8L17 8.5h3v10.5H4z", CIRCLE(12, 13.5, 3.4)],
  },
  check: { paths: ["M5 12.5 9.5 17 19 7"] },
  close: { paths: ["M6 6l12 12", "M18 6 6 18"] },
  arrowLeft: { paths: ["M19.5 12H4.5", "M11 5.5l-6.5 6.5L11 18.5"] },
  arrowRight: { paths: ["M4.5 12h15", "M13 5.5l6.5 6.5L13 18.5"] },
  lock: {
    paths: ["M6.5 10.5V8a5.5 5.5 0 0 1 11 0v2.5", "M4.5 10.5h15v9.5h-15z"],
  },
  user: { paths: [CIRCLE(12, 8.5, 3.6), "M5 20.5a7 7 0 0 1 14 0"] },
  settings: {
    paths: [
      "M12 3v2.6M12 18.4V21M3 12h2.6M18.4 12H21M5.6 5.6l1.9 1.9M16.5 16.5l1.9 1.9M18.4 5.6l-1.9 1.9M7.5 16.5l-1.9 1.9",
      CIRCLE(12, 12, 3.2),
    ],
  },
  star: {
    paths: ["M12 3.2l2.7 5.6 6.1.8-4.4 4.3 1.1 6.1L12 17.1l-5.5 2.9 1.1-6.1L3.2 9.6l6.1-.8z"],
    fill: true,
  },
  coin: {
    paths: [
      CIRCLE(12, 12, 8.2),
      "M9.5 9.6c0-1 1.1-1.6 2.5-1.6s2.5.6 2.5 1.6-1.1 1.3-2.5 1.7-2.5.8-2.5 1.8 1.1 1.6 2.5 1.6 2.5-.6 2.5-1.6",
    ],
  },
  sparkles: {
    paths: [
      "M11 3.5 12.8 8.2 17.5 10l-4.7 1.8L11 16.5 9.2 11.8 4.5 10l4.7-1.8z",
      "M18 14.5l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z",
    ],
  },
  lightbulb: {
    paths: ["M8.7 16.5a5.8 5.8 0 1 1 6.6 0V18h-6.6z", "M9.8 21h4.4", "M12 3V1.5"],
  },
  refresh: { paths: ["M20.5 12a8.5 8.5 0 1 1-2.5-6", "M20.8 3.8V10h-6.2"] },
  chart: { paths: ["M4 20V11", "M9.3 20V5", "M14.7 20v-6", "M20 20V8", "M3.5 20.5h17"] },
  book: {
    paths: ["M5 4.8A2.3 2.3 0 0 1 7.3 2.5H19v19H7.3A2.3 2.3 0 0 1 5 19.2z", "M5 17.2h14"],
  },
  globe: {
    paths: [
      CIRCLE(12, 12, 8.5),
      "M3.5 12h17",
      "M12 3.5c-3 3.6-3 13.4 0 17",
      "M12 3.5c3 3.6 3 13.4 0 17",
    ],
  },
  shield: { paths: ["M12 3.2 19 5.8v6.3c0 3.9-2.9 6.6-7 8.7-4.1-2.1-7-4.8-7-8.7V5.8z"] },
  wifiOff: {
    paths: [
      "M3.5 3.5l17 17",
      "M8.6 14.4a5 5 0 0 1 6.8 0",
      "M5.2 11.1A9.5 9.5 0 0 1 8 9.4",
      "M16 9.4a9.5 9.5 0 0 1 2.8 1.7",
      CIRCLE(12, 18.2, 1),
    ],
  },
  clock: { paths: [CIRCLE(12, 12, 8.5), "M12 7v5.2l3.2 2"] },
  plus: { paths: ["M12 5v14", "M5 12h14"] },
  target: { paths: [CIRCLE(12, 12, 8.5), CIRCLE(12, 12, 4.4), CIRCLE(12, 12, 0.9)] },
  pencil: { paths: ["M4 20.2h4L19.6 8.6a2.1 2.1 0 0 0-3-3L5 17.2z", "M15.2 7.4l1.4 1.4"] },
  trash: {
    paths: [
      "M5 7.5h14",
      "M9.5 7.5V5h5v2.5",
      "M7 7.5 7.9 20h8.2L17 7.5",
      "M10.5 11v5.5",
      "M13.5 11v5.5",
    ],
  },
  download: { paths: ["M12 4v11", "M7.5 10.5 12 15l4.5-4.5", "M5 19.5h14"] },
};

export type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
};

export function Icon({ name, size = 24, className, ...props }: IconProps) {
  const definition = ICONS[name];
  const stroked = !definition.fill;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn("shrink-0", className)}
      fill={definition.fill ? "currentColor" : "none"}
      stroke={stroked ? "currentColor" : undefined}
      strokeWidth={stroked ? 2 : undefined}
      strokeLinecap={stroked ? "round" : undefined}
      strokeLinejoin={stroked ? "round" : undefined}
      {...props}
    >
      {definition.paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
