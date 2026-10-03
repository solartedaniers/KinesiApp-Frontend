// Adaptador del contrato de reproducción. Hoy el backend devuelve {token, expires_at} y
// GET /jump-analyses/{id}/video?token= redirige (307) a la URL pública del video en el bucket de Neon,
// que atiende Range. Si video-access pasa a devolver {url, expires_at}, sólo cambia este archivo.
import { API_PATHS } from "./api-paths";

export type VideoAccess = { token: string; expires_at: string };
export type VideoSource = { url: string; expiresAt: number };

export function videoSource(publicApiBase: string, analysisId: number, access: VideoAccess): VideoSource {
  const query = new URLSearchParams({ token: access.token });
  return { url: `${publicApiBase}${API_PATHS.analysisVideo(analysisId)}?${query}`, expiresAt: Date.parse(access.expires_at) };
}
