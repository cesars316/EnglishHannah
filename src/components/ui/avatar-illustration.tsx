import type { Avatar } from "@/types/domain";

export type AvatarIllustrationProps = {
  avatar: Avatar;
  size?: number;
  /** Decorativo: el nombre del avatar se anuncia por texto en la interfaz. */
  className?: string;
};

/**
 * Ilustracion original dibujada con SVG (sin recursos de terceros).
 * La forma de orejas/rasgos cambia segun el avatar para hacerlos distintos.
 */
export function AvatarIllustration({ avatar, size = 96, className }: AvatarIllustrationProps) {
  const { id, primary, soft } = avatar;

  const ears = (): React.ReactNode => {
    switch (id) {
      case "fox-explorer":
        return (
          <>
            <path d="M24 30 20 6l22 13z" fill={primary} />
            <path d="M96 30 100 6 78 19z" fill={primary} />
          </>
        );
      case "owl-scholar":
        return (
          <>
            <path d="M28 32 22 8l20 10z" fill={primary} />
            <path d="M92 32 98 8 78 18z" fill={primary} />
          </>
        );
      case "cat-artist":
        return (
          <>
            <path d="M26 30 24 8l20 12z" fill={primary} />
            <path d="M94 30 96 8 76 20z" fill={primary} />
          </>
        );
      case "panda-pilot":
        return (
          <>
            <circle cx="26" cy="26" r="12" fill={primary} />
            <circle cx="94" cy="26" r="12" fill={primary} />
          </>
        );
      case "dolphin-diver":
        return (
          <>
            <path d="M22 62 4 46l6 30z" fill={primary} />
            <path d="M98 62 116 46l-6 30z" fill={primary} />
          </>
        );
      case "unicorn-dreamer":
        return (
          <>
            <path
              d="M26 44c8 20 22 34 34 44"
              fill="none"
              stroke="#f17fa6"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path d="M50 26 60 2l10 24z" fill="#f5b32b" />
            <path d="M28 30 22 8l20 12z" fill={primary} />
            <path d="M92 30 98 8 78 20z" fill={primary} />
          </>
        );
      default:
        return (
          <>
            <path d="M34 18a10 10 0 0 0-10 10v6h20v-6a10 10 0 0 0-10-10z" fill={primary} />
            <path d="M86 18a10 10 0 0 1 10 10v6H76v-6a10 10 0 0 1 10-10z" fill={primary} />
          </>
        );
    }
  };

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
    >
      <circle cx="60" cy="60" r="58" fill={soft} />
      <circle
        cx="60"
        cy="60"
        r="58"
        fill="none"
        stroke={primary}
        strokeOpacity="0.35"
        strokeWidth="3"
      />
      {ears()}
      <path d="M60 22c22 0 34 16 34 34s-14 32-34 32-34-14-34-32 12-34 34-34z" fill={primary} />
      {id === "panda-pilot" && (
        <>
          <ellipse cx="46" cy="56" rx="11" ry="13" fill={soft} />
          <ellipse cx="74" cy="56" rx="11" ry="13" fill={soft} />
        </>
      )}
      {id === "dolphin-diver" ? (
        <>
          <circle cx="47" cy="54" r="4.5" fill="#221b16" />
          <circle cx="73" cy="54" r="4.5" fill="#221b16" />
          <circle cx="48.6" cy="52.4" r="1.6" fill="#ffffff" />
          <circle cx="74.6" cy="52.4" r="1.6" fill="#ffffff" />
          <path
            d="M42 70q18 12 36 0"
            fill="none"
            stroke="#221b16"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx="46" cy="52" r="6" fill="#ffffff" />
          <circle cx="74" cy="52" r="6" fill="#ffffff" />
          <circle cx="47" cy="52.5" r="3.2" fill="#221b16" />
          <circle cx="75" cy="52.5" r="3.2" fill="#221b16" />
          <path
            d="M54 66q6 6 12 0"
            fill="none"
            stroke="#221b16"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <ellipse cx="60" cy="61" rx="4" ry="3" fill="#221b16" />
        </>
      )}
      <circle cx="34" cy="63" r="5" fill="#f17fa6" opacity="0.5" />
      <circle cx="86" cy="63" r="5" fill="#f17fa6" opacity="0.5" />
      {id === "bee-builder" && (
        <>
          <path d="M40 20 34 4M80 20l6-16" stroke="#96660a" strokeWidth="3" strokeLinecap="round" />
          <circle cx="33" cy="3" r="4" fill="#f5b32b" />
          <circle cx="87" cy="3" r="4" fill="#f5b32b" />
        </>
      )}
    </svg>
  );
}
