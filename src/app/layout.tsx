import type { Metadata, Viewport } from "next";

import { MotionPreference } from "@/components/layout/motion-preference";
import { ServiceWorkerRegistration } from "@/components/layout/service-worker-registration";
import { ProfileProvider } from "@/features/profile/profile-context";
import { SITE } from "@/config/game";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} - aprende ingles jugando`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  // Iconos: los SVG cubren navegadores modernos; los PNG (npm run icons) son
  // para iOS, que no acepta SVG ni el `apple-touch-icon` generado por Next.
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: SITE.name,
    statusBarStyle: "default",
  },
  // La aplicacion no se publica todavia y contiene zonas privadas:
  // se mantiene fuera de los motores de busqueda (docs/PRIVACY.md).
  robots: { index: false, follow: false, nocache: true },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffbf4",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <a
          href="#contenido"
          className="sr-only-focusable shadow-float absolute top-2 left-2 z-50 rounded-xl bg-white px-4 py-2 font-bold"
        >
          Saltar al contenido
        </a>
        <MotionPreference />
        <ServiceWorkerRegistration />
        <ProfileProvider>{children}</ProfileProvider>
      </body>
    </html>
  );
}
