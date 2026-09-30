import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "KinesiApp", template: "%s · KinesiApp" },
  description:
    "Análisis de video del salto y la sentadilla para detectar riesgo de lesión de rodilla.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1419" },
  ],
};

// Fase 1: idioma y tema desde las cookies kin_locale/kin_theme (§9.1)
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
