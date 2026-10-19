"use client";

import { useEffect, useRef, useState } from "react";

import { ChartFrame, linePath, makePlot, percentX, type Tick } from "./ChartFrame";
import { LabIcon } from "../LabIcon";
import { RISK_TEXT, RiskGauge, riskPatternId } from "../Risk";

import type { RiskLevel } from "@/lib/design/risk";
import { type AngleSample, valueAt } from "@/lib/design/sample-analysis";

export type TimelineSeries = { key: string; label: string; samples: AngleSample[]; tone: "accent" | "alt" };
export type TimelineRepetition = { startMs: number; endMs: number; level: RiskLevel; label: string };

const styles = {
  root: "grid gap-4",
  readout: "grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-x-6 gap-y-3",
  reading: "grid gap-0.5",
  readingLabel: "flex items-center gap-2 text-sm text-ink-muted",
  swatch: { accent: "h-0.5 w-4 bg-accent", alt: "h-0.5 w-4 bg-trace-alt" },
  readingValue: "font-mono text-3xl font-medium text-ink [font-variant-numeric:tabular-nums]",
  series: { accent: "lab-glow fill-none stroke-accent [stroke-width:2] [vector-effect:non-scaling-stroke]", alt: "fill-none stroke-trace-alt [stroke-width:1.5] [vector-effect:non-scaling-stroke]" },
  playhead: "pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-ink",
  reps: "relative flex h-9 gap-px",
  rep:
    "relative grid flex-1 place-items-center overflow-hidden rounded-[2px] bg-sunken text-xs font-semibold " +
    "transition-[transform] duration-[var(--kin-motion-hover)] hover:-translate-y-0.5 aria-current:outline-2 aria-current:outline-ink",
  repFill: "absolute inset-0 size-full opacity-60",
  controls: "flex items-center gap-3",
  play: "grid size-11 flex-none place-items-center rounded-tag bg-accent text-on-accent hover:bg-accent-hover active:translate-y-px",
  range: "h-11 w-full min-w-0 cursor-pointer accent-accent",
  time: "min-w-[5.5ch] text-right font-mono text-sm text-ink [font-variant-numeric:tabular-nums]",
};

/**
 * Ángulos a lo largo del video con un cabezal sincronizado. En la guía lo mueve un reloj propio; en
 * el análisis real lo moverá el timeupdate del <video>. Las repeticiones son botones para saltar a ellas.
 */
export function AngleTimeline({
  series, repetitions, durationMs, yTicks, xTicks, labels,
}: {
  series: TimelineSeries[];
  repetitions: TimelineRepetition[];
  durationMs: number;
  yTicks: Tick[];
  xTicks: Tick[];
  labels: { chart: string; playhead: string; play: string; pause: string; repetitions: string; seconds: string; degrees: string };
}) {
  const [ms, setMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const position = useRef(0);
  const plot = makePlot([0, durationMs], [yTicks[0].value, yTicks.at(-1)!.value]);

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
  const current = repetitions.findIndex((rep) => ms >= rep.startMs && ms < rep.endMs);
  const seconds = (value: number) => `${(value / 1000).toFixed(1)} ${labels.seconds}`;

  return (
    <div className={styles.root}>
      <div className={styles.readout} aria-live="off">
        {series.map((s) => (
          <p key={s.key} className={styles.reading}>
            <span className={styles.readingLabel}><span className={styles.swatch[s.tone]} aria-hidden />{s.label}</span>
            <span className={styles.readingValue}>{Math.round(valueAt(s.samples, ms) ?? 0)}{labels.degrees}</span>
          </p>
        ))}
      </div>
      <ChartFrame
        plot={plot}
        yTicks={yTicks}
        xTicks={xTicks}
        height="h-56 sm:h-64"
        label={labels.chart}
        overlay={<span className={styles.playhead} style={{ left: percentX(plot, ms) }} />}
      >
        {series.map((s) => (
          <path key={s.key} className={styles.series[s.tone]} d={linePath(s.samples.map((p) => ({ x: p.ms, y: p.degrees })), plot)} />
        ))}
      </ChartFrame>
      <div className="grid grid-cols-[2.75rem_1fr]">
        <span />
        <div className={styles.reps} role="group" aria-label={labels.repetitions}>
          {repetitions.map((rep, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.rep} ${RISK_TEXT[rep.level]}`}
              aria-current={i === current || undefined}
              aria-label={rep.label}
              onClick={() => seek(rep.startMs)}
            >
              <svg className={styles.repFill} aria-hidden><rect width="100%" height="100%" fill={`url(#${riskPatternId(rep.level)})`} /></svg>
              <span className="relative"><RiskGauge level={rep.level} size={14} /></span>
            </button>
          ))}
        </div>
      </div>
      <div className={styles.controls}>
        <button type="button" className={styles.play} onClick={togglePlay} aria-label={playing ? labels.pause : labels.play}>
          <LabIcon name={playing ? "pause" : "play"} size={20} />
        </button>
        <input
          type="range"
          className={styles.range}
          min={0}
          max={durationMs}
          step={100}
          value={Math.round(ms)}
          onChange={(event) => seek(Number(event.currentTarget.value))}
          aria-label={labels.playhead}
          aria-valuetext={seconds(ms)}
        />
        <output className={styles.time}>{seconds(ms)}</output>
      </div>
    </div>
  );
}
