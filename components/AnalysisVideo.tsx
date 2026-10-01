"use client";

import { useRef, useState } from "react";

import { FormAlert } from "@/components/ui/FormAlert";
import { API_PATHS } from "@/lib/api-paths";
import { publicApiBaseUrl, VIDEO_URL_RENEW_MARGIN_MS } from "@/lib/config";
import { t } from "@/lib/i18n";
import { proxyUrl } from "@/lib/proxy-allowlist";
import { videoSource, type VideoAccess, type VideoSource } from "@/lib/video";

import styles from "./AnalysisVideo.module.css";

/**
 * <video> nativo: el navegador pide Range solo y el servidor responde 206 (§6.1). Cliente sólo
 * para un caso: la URL firmada vence (10 min) y, si el usuario adelanta después, el 206 siguiente
 * falla; entonces se pide otra URL por /api/proxy y se retoma en el mismo segundo.
 */
export function AnalysisVideo({ analysisId, initial }: { analysisId: number; initial: VideoSource }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const resumeAt = useRef(0);
  const [source, setSource] = useState(initial);
  const [failed, setFailed] = useState(false);

  async function handleError() {
    const video = videoRef.current;
    // Si la URL sigue vigente, el problema es el archivo o el códec: no tiene sentido renovar
    if (!video || Date.now() < source.expiresAt - VIDEO_URL_RENEW_MARGIN_MS) {
      setFailed(true);
      return;
    }
    try {
      const response = await fetch(proxyUrl(API_PATHS.analysisVideoAccess(analysisId)), { cache: "no-store" });
      if (!response.ok) throw new Error(String(response.status));
      resumeAt.current = video.currentTime;
      setSource(videoSource(publicApiBaseUrl(), analysisId, (await response.json()) as VideoAccess));
    } catch {
      setFailed(true);
    }
  }

  function resume() {
    if (videoRef.current && resumeAt.current > 0) videoRef.current.currentTime = resumeAt.current;
  }

  if (failed) return <FormAlert tone="error">{t.analysisDetail.videoError}</FormAlert>;

  return (
    <video
      ref={videoRef}
      className={styles.video}
      src={source.url}
      controls
      playsInline
      preload="metadata"
      onError={handleError}
      onLoadedMetadata={resume}
    >
      {t.analysisDetail.videoUnsupported}
    </video>
  );
}
