"use client";

import { useEffect, useRef, useState } from "react";

import { AngleTimeline } from "@/components/instrument/charts/AngleTimeline";
import { ErrorState, LoadingState } from "@/components/instrument/States";
import { renewPlaybackUrl } from "@/lib/actions/analyses";
import { buildTimeline } from "@/lib/analysis-timeline";
import { VIDEO_URL_RENEW_MARGIN_MS } from "@/lib/config";
import type { KneeTarget } from "@/lib/design/signals";
import { useT } from "@/lib/i18n/client";
import type { JointAngleMeasurement, MovementType, RiskAssessment, SignedUrl } from "@/lib/types";

type Props = {
  analysisId: string;
  initial: SignedUrl;
  measurements: JointAngleMeasurement[];
  assessment: RiskAssessment | null;
  target: KneeTarget | null;
  movement: MovementType;
};

/**
 * La línea de tiempo con el <video> real como escenario: su reloj mueve el cabezal, y tocar una
 * repetición o la barra mueve el video. Las muestras se procesan por partes, cediendo el hilo, para
 * que la página responda mientras tanto.
 *
 * El navegador pide Range directo al bucket privado con la URL firmada. Si vence y el usuario adelanta,
 * el 206 siguiente falla: pido otra con GetVideoPlaybackUrl y retomo en el mismo segundo.
 */
export function VideoTimeline({ analysisId, initial, measurements, assessment, target, movement }: Props) {
  const t = useT();
  const video = useRef<HTMLVideoElement>(null);
  const resumeAt = useRef(0);
  const [timeline, setTimeline] = useState<Awaited<ReturnType<typeof buildTimeline>> | null>(null);
  const [source, setSource] = useState(initial);
  const [failed, setFailed] = useState(false);
  const [ms, setMs] = useState(0);
  const [videoMs, setVideoMs] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let active = true;
    void buildTimeline(measurements, assessment).then((built) => active && setTimeline(built));
    return () => {
      active = false;
    };
  }, [measurements, assessment]);

  // timeupdate llega unas cuatro veces por segundo: mientras reproduce, leo el reloj en cada cuadro
  useEffect(() => {
    if (!playing) return;
    let frame = requestAnimationFrame(function tick() {
      if (video.current) setMs(video.current.currentTime * 1000);
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  async function recover() {
    const element = video.current;
    // Si la URL sigue vigente, el problema es el archivo o el códec: no tiene sentido renovar
    if (!element || Date.now() < Date.parse(source.expires_at) - VIDEO_URL_RENEW_MARGIN_MS) return setFailed(true);
    const renewed = await renewPlaybackUrl(analysisId).catch(() => null);
    if (!renewed) return setFailed(true);
    resumeAt.current = element.currentTime;
    setSource(renewed);
  }

  function seek(value: number) {
    if (video.current) video.current.currentTime = value / 1000;
    setMs(value);
  }

  if (failed) return <ErrorState title={t.analysisDetail.videoError} body={t.analysisDetail.videoUnsupported} />;
  if (!timeline) return <LoadingState label={t.analysisDetail.preparing} />;

  return (
    <AngleTimeline
      {...timeline}
      durationMs={Math.max(timeline.durationMs, videoMs)}
      target={target}
      zoneNames={t.analysis.kneeZones[movement]}
      ms={ms}
      playing={playing}
      onSeek={seek}
      onTogglePlay={() => (video.current?.paused ? void video.current.play() : video.current?.pause())}
      layout="video"
      stage={
        <figure data-theme="dark" className="kin-stage overflow-hidden rounded-stage text-on-stage">
          <video
            ref={video}
            className="block aspect-[3/4] max-h-[70vh] w-full object-contain sm:aspect-video"
            src={source.url}
            playsInline
            muted
            preload="metadata"
            aria-label={t.analysisDetail.video}
            onError={recover}
            onLoadedMetadata={(event) => {
              const element = event.currentTarget;
              if (Number.isFinite(element.duration)) setVideoMs(element.duration * 1000);
              if (resumeAt.current > 0) element.currentTime = resumeAt.current;
            }}
            onTimeUpdate={(event) => setMs(event.currentTarget.currentTime * 1000)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          >
            {t.analysisDetail.videoUnsupported}
          </video>
        </figure>
      }
    />
  );
}
