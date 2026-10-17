import type { Metadata, Viewport } from "next";

import { MotionPreference } from "@/components/layout/motion-preference";
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
        <MotionPreference />
        <ProfileProvider>{children}</ProfileProvider>
      </body>
    </html>
  );
}
