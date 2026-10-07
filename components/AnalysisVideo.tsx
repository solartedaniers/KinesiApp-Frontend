"use client";

import { useMemo, useRef, useState } from "react";

import { RISK_FILL } from "@/components/analysis/risk-classes";
import { FormAlert } from "@/components/ui/FormAlert";
import { anglesByJoint, type RiskLevel } from "@/lib/analysis-stats";
import { angleAt, peakMoments, timelinePercent } from "@/lib/analysis-timeline";
import { API_PATHS } from "@/lib/api-paths";
import { publicApiBaseUrl, VIDEO_URL_RENEW_MARGIN_MS } from "@/lib/config";
import { format } from "@/lib/i18n";
import { useFormat, useT } from "@/lib/i18n/client";
import { proxyUrl } from "@/lib/proxy-allowlist";
import type { JointAngleMeasurement } from "@/lib/types";
import { videoSource, type VideoAccess, type VideoSource } from "@/lib/video";

// Trazo de cada articulación en la línea de tiempo: mismo cian, distinto patrón (no otro color)
const SERIES_DASH = [undefined, "4 4"];
const CHART_HEIGHT = 56;

/**
 * Escenario del análisis: el <video> nativo con los ángulos medidos en el instante actual encima y,
 * debajo, la línea de tiempo con el pico de cada articulación (tocarlo lleva el video a ese instante).
 *
 * <video> nativo: el navegador pide Range solo y el servidor responde 206 (§6.1). La URL firmada
 * vence (10 min) y, si el usuario adelanta después, el 206 siguiente falla; entonces se pide otra
 * URL por /api/proxy y se retoma en el mismo segundo.
 */
export function AnalysisVideo({
  analysisId,
  initial,
  measurements = [],
  risk,
}: {
  analysisId: number;
  initial: VideoSource;
  measurements?: JointAngleMeasurement[];
  risk?: RiskLevel;
}) {
  const t = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const resumeAt = useRef(0);
  const [source, setSource] = useState(initial);
  const [failed, setFailed] = useState(false);
  const [currentMs, setCurrentMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);

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
    const video = videoRef.current;
    if (!video) return;
    if (Number.isFinite(video.duration)) setDurationMs(video.duration * 1000);
    if (resumeAt.current > 0) video.currentTime = resumeAt.current;
  }

  function seek(ms: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = ms / 1000;
    setCurrentMs(ms);
  }

  if (failed) return <FormAlert tone="error">{t.analysisDetail.videoError}</FormAlert>;

  return (
    <div className="overflow-hidden rounded-stage bg-stage text-on-stage">
      <div className="relative">
        <video
          ref={videoRef}
          className="block aspect-[3/4] max-h-[72vh] w-full bg-stage object-contain sm:aspect-video"
          src={source.url}
          controls
          playsInline
          preload="metadata"
          onError={handleError}
          onLoadedMetadata={resume}
          onTimeUpdate={(event) => setCurrentMs(event.currentTarget.currentTime * 1000)}
          onSeeked={(event) => setCurrentMs(event.currentTarget.currentTime * 1000)}
        >
          {t.analysisDetail.videoUnsupported}
        </video>
        {measurements.length > 0 && <LiveAngles measurements={measurements} currentMs={currentMs} />}
      </div>
      {measurements.length > 0 && (
        <Timeline measurements={measurements} currentMs={currentMs} durationMs={durationMs} risk={risk} onSeek={seek} />
      )}
    </div>
  );
}

function useJointName() {
  const t = useT();
  return (joint: string) => t.joints[joint as keyof typeof t.joints] ?? joint;
}

/** Ángulo de cada articulación en el cuadro actual, arriba a la izquierda del video. */
function LiveAngles({ measurements, currentMs }: { measurements: JointAngleMeasurement[]; currentMs: number }) {
  const t = useT();
  const fmt = useFormat();
  const jointName = useJointName();
  const series = useMemo(() => anglesByJoint(measurements), [measurements]);
  return (
    <dl
      className="pointer-events-none absolute left-3 top-3 grid gap-1 rounded-control bg-stage/80 px-3 py-2 backdrop-blur-sm"
      aria-label={t.analysisDetail.liveAngles}
    >
      {series.map(({ joint, points }) => (
        <div key={joint} className="flex items-baseline justify-between gap-4">
          <dt className="text-xs text-on-stage/80">{jointName(joint)}</dt>
          <dd className="font-display text-lg font-semibold tabular-nums text-accent-vivid">
            {fmt.degrees(angleAt(points, currentMs)?.angle_degrees ?? 0)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Timeline({
  measurements,
  currentMs,
  durationMs,
  risk,
  onSeek,
}: {
  measurements: JointAngleMeasurement[];
  currentMs: number;
  durationMs: number;
  risk?: RiskLevel;
  onSeek: (ms: number) => void;
}) {
  const t = useT();
  const fmt = useFormat();
  const jointName = useJointName();
  const series = useMemo(() => anglesByJoint(measurements), [measurements]);
  const peaks = useMemo(() => peakMoments(series), [series]);
  // Hasta que el video da su duración, la escala llega a la última medición
  const lastMs = Math.max(...measurements.map((measurement) => measurement.frame_timestamp_ms));
  const spanMs = Math.max(durationMs, lastMs, 1);
  const maxDegrees = Math.max(...series.map((joint) => joint.peak), 1);
  const y = (degrees: number) => CHART_HEIGHT - 4 - (degrees / maxDegrees) * (CHART_HEIGHT - 12);

  return (
    <div className="grid gap-2 border-t border-on-stage/15 px-3 pb-3 pt-2.5 sm:px-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-on-stage/80">
        <span className="font-medium text-on-stage">{t.analysisDetail.timeline}</span>
        <span className="flex gap-4" aria-hidden>
          {series.map(({ joint }, index) => (
            <span key={joint} className="flex items-center gap-1.5">
              <svg width="18" height="6">
                <path d="M0 3h18" className="stroke-accent-vivid" strokeWidth="2" strokeDasharray={SERIES_DASH[index]} />
              </svg>
              {jointName(joint)}
            </span>
          ))}
        </span>
      </div>

      <div className="relative mt-2" style={{ height: CHART_HEIGHT }}>
        {/* Tocar la pista lleva el video a ese instante (con teclado: los controles del video y las marcas) */}
        <svg
          viewBox={`0 0 1000 ${CHART_HEIGHT}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full cursor-pointer"
          aria-hidden
          onClick={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            onSeek(((event.clientX - box.left) / box.width) * spanMs);
          }}
        >
          <path d={`M0 ${CHART_HEIGHT - 0.5}H1000`} className="stroke-on-stage/25" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          {series.map(({ joint, points }, index) => (
            <path
              key={joint}
              d={points.map((point, i) => `${i ? "L" : "M"}${(point.frame_timestamp_ms / spanMs) * 1000} ${y(point.angle_degrees)}`).join("")}
              className="fill-none stroke-accent-vivid"
              strokeOpacity={index ? 0.75 : 1}
              strokeWidth="2"
              strokeDasharray={SERIES_DASH[index]}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        {/* Cabezal de reproducción */}
        <span
          className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-on-stage"
          style={{ left: `${timelinePercent(currentMs, spanMs)}%` }}
          aria-hidden
        />
        {/* Picos: el marcador lleva el color del nivel de riesgo del análisis */}
        {peaks.map((peak) => {
          const label = format(t.analysisDetail.peakMarker, {
            joint: jointName(peak.joint),
            value: fmt.degrees(peak.degrees),
            time: fmt.secondsFromMs(peak.ms),
          });
          return (
            <button
              key={peak.joint}
              type="button"
              onClick={() => onSeek(peak.ms)}
              aria-label={label}
              title={label}
              className="absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full focus-visible:outline-accent-vivid"
              style={{ left: `${timelinePercent(peak.ms, spanMs)}%`, top: y(peak.degrees) }}
            >
              <span className={`size-3.5 rounded-full ring-2 ring-on-stage ${risk ? RISK_FILL[risk] : "bg-accent-vivid"}`} />
            </button>
          );
        })}
      </div>

      <div className="flex justify-between text-xs tabular-nums text-on-stage/70">
        <span>{fmt.secondsFromMs(0)}</span>
        <span className="font-medium text-on-stage">{fmt.secondsFromMs(currentMs)}</span>
        <span>{fmt.secondsFromMs(spanMs)}</span>
      </div>
      <p className="text-xs text-on-stage/70">{t.analysisDetail.timelineHint}</p>
    </div>
  );
}
