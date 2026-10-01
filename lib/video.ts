// Adaptador del contrato de reproducción. Hoy el backend devuelve {token, expires_at} y el video se
// sirve desde GET /jump-analyses/{id}/video?token= (con Range). Cuando la fase 0.5 cambie
// video-access a {url, expires_at} (R2, video-analysis-pipeline.md §10.3), sólo cambia este archivo.
import { API_PATHS } from "./api-paths";

export type VideoAccess = { token: string; expires_at: string };
export type VideoSource = { url: string; expiresAt: number };

export function videoSource(publicApiBase: string, analysisId: number, access: VideoAccess): VideoSource {
  const query = new URLSearchParams({ token: access.token });
  return { url: `${publicApiBase}${API_PATHS.analysisVideo(analysisId)}?${query}`, expiresAt: Date.parse(access.expires_at) };
}
