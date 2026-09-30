import type { MetadataRoute } from "next";

// Fase 6 completa íconos y el Service Worker (§7.2)
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KinesiApp",
    short_name: "KinesiApp",
    start_url: "/home",
    display: "standalone",
    background_color: "#0f1419",
    theme_color: "#0a7c6c",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
