"use client";

import { type ComponentProps, useEffect, useRef, useState } from "react";

import { AngleTimeline } from "./AngleTimeline";
import { PoseFigure } from "../PoseFigure";

import { valueAt } from "@/lib/analysis-timeline";
import { squatPoseAt } from "@/lib/design/pose";
import { useT } from "@/lib/i18n/client";

type Props = Omit<ComponentProps<typeof AngleTimeline>, "ms" | "playing" | "onSeek" | "onTogglePlay" | "stage" | "layout">;

/** La línea de tiempo de la guía: un reloj propio mueve el cabezal y el esqueleto hace de video. */
export function SimulatedTimeline(props: Props) {
  const c = useT().styleGuide.charts;
  const { durationMs, primary } = props;
  const [ms, setMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const position = useRef(0);

  useEffect(() => {
    if (!playing) return;
    let previous: number | null = null;
    let frame = requestAnimationFrame(function tick(now) {
      position.current = Math.min(durationMs, position.current + (previous === null ? 0 : now - previous));
      previous = now;
      setMs(position.current);
      if (position.current >= durationMs) setPlaying(false);
      else frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing, durationMs]);

  const seek = (value: number) => {
    position.current = value;
    setMs(value);
  };
  const togglePlay = () => {
    if (!playing && position.current >= durationMs) seek(0);
    setPlaying(!playing);
  };
  const seconds = `${(ms / 1000).toFixed(1)} ${c.seconds}`;

  return (
    <AngleTimeline
      {...props}
      ms={ms}
      playing={playing}
      onSeek={seek}
      onTogglePlay={togglePlay}
      stage={
        <figure data-theme="dark" className="kin-stage grid aspect-[4/3] place-items-center rounded-stage text-on-stage sm:aspect-auto">
          <svg viewBox="-50 -116 106 126" className="h-full max-h-60 w-full" role="img" aria-label={`${c.stage}: ${seconds}`}>
            <line x1="-50" x2="56" y1="0" y2="0" className="stroke-line-strong" strokeWidth="0.8" />
            <PoseFigure keypoints={squatPoseAt(valueAt(primary, ms) ?? 0)} />
          </svg>
          <figcaption className="absolute top-2 left-3 font-display text-xs font-semibold text-on-stage [font-variant-numeric:tabular-nums]">{seconds}</figcaption>
        </figure>
      }
    />
  );
}
