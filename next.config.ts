import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Politica de seguridad de contenido (CSP).
 *
 * Por que SIN `nonce`: un nonce obliga a generar un valor por peticion y a
 * propagarlo a cada `<script>`, lo que exige `middleware` y fuerza render
 * dinamico en TODAS las rutas (se pierde el render estatico). Este proyecto es
 * una app de un solo inquilino, sin terceros, sin contenido de usuarios y con
 * todos los recursos locales, asi que la ganancia de seguridad no compensa ese
 * coste. Ver `docs/ARCHITECTURE.md` (seccion "Cabeceras de seguridad").
 *
 * Nota sobre `script-src`: Next inyecta scripts inline (hidratacion y datos) y
 * no expone una forma estable de autorizarlos sin nonce o hash, por lo que se
 * permite `'unsafe-inline'`. A cambio se cierra todo lo demas con `'self'` y
 * `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`.
 */
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  // El HMR de Next usa WebSocket; la API vive en el mismo origen.
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "media-src 'self' blob:",
  "manifest-src 'self'",
  "worker-src 'self'",
  // Solo en desarrollo: Next/Turbopack evaluan codigo y sirven source maps.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
];

/** Cabeceras de seguridad globales. */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(self), geolocation=(), payment=(), usb=()",
  },
  { key: "Content-Security-Policy", value: CSP_DIRECTIVES.join("; ") },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Recursos locales versionados en el repositorio (ADR 0005 / docs/CONTENT_GUIDE.md).
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // La zona parental (`/padres`) ya se marca con `metadata.robots`, pero
        // la cabecera cubre tambien las respuestas no-HTML (p. ej. errores).
        source: "/padres/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
