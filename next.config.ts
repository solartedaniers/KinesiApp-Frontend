import type { NextConfig } from "next";

import { DEFAULT_LOCALE } from "./lib/i18n/locale.ts";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nadie puede incrustar la app en un iframe (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Cámara sólo para la propia app (grabación); la grabación no usa audio
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Hay dos layouts raíz (el sitio público estático y la app): no existe uno común para el 404
  experimental: { globalNotFound: true },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // El Service Worker siempre se revalida: si quedara en caché, un despliegue no lo actualizaría
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
  // Rutas renombradas: los enlaces viejos (marcadores, correos, historial) siguen funcionando
  async redirects() {
    return [
      { source: "/analysis/:path*", destination: "/analyses/:path*", permanent: true },
      { source: "/report/:id", destination: "/analyses/:id", permanent: true },
      // El informe ahora se genera en PDF desde la pantalla del análisis
      { source: "/analyses/:id/report", destination: "/analyses/:id", permanent: true },
      // El español va sin prefijo: /es duplicaría las mismas páginas
      { source: `/${DEFAULT_LOCALE}`, destination: "/", permanent: true },
      { source: `/${DEFAULT_LOCALE}/:path*`, destination: "/:path*", permanent: true },
    ];
  },
  // El sitio público vive en app/(site)/[locale]; sin prefijo sirvo las páginas prerenderizadas del español
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: `/${DEFAULT_LOCALE}` },
        { source: "/guide/:movement", destination: `/${DEFAULT_LOCALE}/guide/:movement` },
        { source: "/offline", destination: `/${DEFAULT_LOCALE}/offline` },
      ],
    };
  },
};

export default nextConfig;
