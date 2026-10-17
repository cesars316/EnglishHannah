import { cn } from "@/lib/cn";

export type MascotName = "pip" | "mia" | "bloop";
export type MascotMood = "happy" | "cheering" | "thinking";

export type MascotProps = {
  name?: MascotName;
  mood?: MascotMood;
  size?: number;
  className?: string;
};

const COLORS: Record<MascotName, { main: string; soft: string; detail: string }> = {
  pip: { main: "#ea5a28", soft: "#ffe3d3", detail: "#221b16" },
  mia: { main: "#0f5896", soft: "#dceefe", detail: "#221b16" },
  bloop: { main: "#6d4fbf", soft: "#efe9fb", detail: "#221b16" },
};

/**
 * Personajes originales del documento maestro (seccion 18):
 * Pip (zorro explorador), Mia (niña exploradora) y Bloop (criatura amistosa).
 * Son decorativos: el texto siempre acompana al personaje.
 */
export function Mascot({ name = "pip", mood = "happy", size = 88, className }: MascotProps) {
  const { main, soft, detail } = COLORS[name];

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={cn("animate-soft-in", className)}
    >
      <ellipse cx="60" cy="110" rx="34" ry="6" fill={detail} opacity="0.08" />
      {name === "bloop" ? (
        <>
          <path
            d="M60 14c20 0 34 14 34 34 0 22-16 38-34 38S26 70 26 48c0-20 14-34 34-34z"
            fill={main}
          />
          <path d="M60 14c8 0 12 8 12 14H48c0-6 4-14 12-14z" fill={soft} />
          <circle cx="48" cy="50" r="7" fill="#ffffff" />
          <circle cx="72" cy="50" r="7" fill="#ffffff" />
          <circle cx="49" cy="51" r="3.4" fill={detail} />
          <circle cx="73" cy="51" r="3.4" fill={detail} />
        </>
      ) : name === "pip" ? (
        <>
          <path d="M26 34 22 8l24 14z" fill={main} />
          <path d="M94 34 98 8 74 22z" fill={main} />
          <path d="M60 20c22 0 34 15 34 32S78 88 60 88 26 69 26 52 38 20 60 20z" fill={main} />
          <path d="M46 76q14 12 28 0-14 6-28 0z" fill={soft} />
          <circle cx="46" cy="50" r="7" fill="#ffffff" />
          <circle cx="74" cy="50" r="7" fill="#ffffff" />
          <circle cx="47" cy="51" r="3.4" fill={detail} />
          <circle cx="75" cy="51" r="3.4" fill={detail} />
          <ellipse cx="60" cy="66" rx="5" ry="3.6" fill={detail} />
        </>
      ) : (
        <>
          <circle cx="60" cy="52" r="30" fill={main} />
          <path d="M32 44c-6-10-2-20 6-22 6-1 10 3 12 8z" fill={detail} />
          <path d="M88 44c6-10 2-20-6-22-6-1-10 3-12 8z" fill={detail} />
          <circle cx="48" cy="50" r="6.5" fill="#ffffff" />
          <circle cx="72" cy="50" r="6.5" fill="#ffffff" />
          <circle cx="49" cy="51" r="3.2" fill={detail} />
          <circle cx="73" cy="51" r="3.2" fill={detail} />
          <path
            d="M50 66q10 9 20 0"
            fill="none"
            stroke={detail}
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <path d="M36 84h48l-6 22H42z" fill={soft} />
        </>
      )}
      {mood === "cheering" && (
        <>
          <circle cx="22" cy="18" r="4" fill="#f5b32b" />
          <circle cx="100" cy="24" r="3" fill="#f17fa6" />
          <circle cx="88" cy="10" r="3.5" fill="#4ba9f2" />
        </>
      )}
      {mood === "thinking" && (
        <circle cx="98" cy="22" r="7" fill="#ffffff" stroke={detail} strokeWidth="2.5" />
      )}
    </svg>
  );
}
