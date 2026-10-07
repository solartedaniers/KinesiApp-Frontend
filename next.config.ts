import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nadie puede incrustar la app en un iframe (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Cámara sólo para la propia app (grabación, §5.1); la grabación no usa audio
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Avatar en base64 (<= ~1.34 MB) por Server Action (§7.1); por debajo de los 4.5 MB de Vercel
      bodySizeLimit: "2mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Rutas renombradas: los enlaces viejos (marcadores, correos, historial) siguen funcionando
  async redirects() {
    return [
      { source: "/analysis/:path*", destination: "/analyses/:path*", permanent: true },
      { source: "/report/:id", destination: "/analyses/:id/report", permanent: true },
    ];
  },
};

export default nextConfig;
