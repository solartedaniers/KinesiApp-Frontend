"use client";

import { useEffect, useId, useRef, useState } from "react";

import { CANVAS, ChartFrame, linePath, makePlot, percentX, percentY } from "./ChartFrame";
import { Glyph } from "../Glyph";
import { PoseFigure } from "../PoseFigure";
import { ZoneChip } from "../Status";

import { niceTicks } from "@/lib/charts/scale";
import { cssVars } from "@/lib/design/css";
import { squatPoseAt } from "@/lib/design/pose";
import type { RiskLevel } from "@/lib/design/risk";
import { type AngleSample, valueAt } from "@/lib/design/sample-analysis";
import { SIGNAL_CLASS, TARGET_KNEE, ZONE_CLASS, zoneOf, zoneSpans } from "@/lib/design/signals";
import { format } from "@/lib/i18n";
import { useFormat, useT } from "@/lib/i18n/client";

export type TimelineRepetition = { startMs: number; endMs: number; level: RiskLevel; peak: AngleSample };

type Props = { knee: AngleSample[]; trunk: AngleSample[]; repetitions: TimelineRepetition[]; durationMs: number };

const line = "fill-none [vector-effect:non-scaling-stroke]";

/**
 * Ángulos a lo largo del video con un cabezal que comparten el cuadro del video, el esqueleto y la
 * gráfica. En la guía lo mueve un reloj propio; en el análisis real lo moverá el timeupdate del <video>.
 */
export function AngleTimeline({ knee, trunk, repetitions, durationMs }: Props) {
  const t = useT();
  const c = t.styleGuide.charts;
  const f = useFormat();
  const gradient = useId();
  const [ms, setMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const position = useRef(0);

  const top = Math.max(...knee.map((s) => s.degrees), TARGET_KNEE[1]);
  const yTicks = niceTicks(0, top, 4).map((value) => ({ value, label: f.degrees(value) }));
  const xTicks = niceTicks(0, durationMs, 8).filter((v) => v <= durationMs).map((value) => ({ value, label: `${value / 1000} ${c.seconds}` }));
  const plot = makePlot([0, durationMs], [0, yTicks.at(-1)!.value]);

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

  const kneeNow = valueAt(knee, ms) ?? 0;
  const trunkNow = valueAt(trunk, ms) ?? 0;
  const zone = zoneOf(kneeNow);
  const current = repetitions.findIndex((rep) => ms >= rep.startMs && ms < rep.endMs);
  const seconds = (value: number) => `${(value / 1000).toFixed(1)} ${c.seconds}`;
  // Cortes del degradado en el lienzo: la rodilla lleva su color y se enciende en verde o rosa al entrar
  // en el objetivo o pasarse, justo donde cruza cada zona
  const cut = (degrees: number) => plot.y(degrees) / CANVAS;

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-[13rem_1fr] sm:items-stretch">
        <figure data-theme="dark" className="kin-stage grid aspect-[4/3] place-items-center rounded-stage text-on-stage sm:aspect-auto">
          <svg viewBox="-50 -116 106 126" className="h-full max-h-60 w-full" role="img" aria-label={`${c.stage}: ${seconds(ms)}`}>
            <line x1="-50" x2="56" y1="0" y2="0" className="stroke-line-strong" strokeWidth="0.8" />
            <PoseFigure keypoints={squatPoseAt(kneeNow)} />
          </svg>
          <figcaption className="absolute top-2 left-3 font-display text-xs font-semibold text-on-stage [font-variant-numeric:tabular-nums]">{seconds(ms)}</figcaption>
        </figure>
        <dl className="grid content-center gap-4 sm:grid-cols-2">
          <div className="kin-well grid gap-1 p-4">
            <dt className="flex items-center gap-2 text-sm text-ink-muted"><span className={`h-1 w-5 rounded-full ${SIGNAL_CLASS.knee.bg}`} aria-hidden />{t.joints.knee_flexion}</dt>
            <dd className="font-display text-3xl font-semibold text-knee [font-variant-numeric:tabular-nums]">{f.degrees(kneeNow)}</dd>
            <dd><ZoneChip zone={zone} label={t.styleGuide.color.names[zone]} /></dd>
          </div>
          <div className="kin-well grid gap-1 p-4">
            <dt className="flex items-center gap-2 text-sm text-ink-muted"><span className={`h-1 w-5 rounded-full ${SIGNAL_CLASS.trunk.bg}`} aria-hidden />{t.joints.trunk_inclination}</dt>
            <dd className="font-display text-3xl font-semibold text-trunk [font-variant-numeric:tabular-nums]">{f.degrees(trunkNow)}</dd>
          </div>
        </dl>
      </div>

      <ChartFrame
        plot={plot}
        yTicks={yTicks}
        xTicks={xTicks}
        height="h-56 sm:h-72"
        label={c.timelineLabel}
        overlay={
          <>
            {repetitions.map((rep, i) => (
              <span
                key={rep.startMs}
                className={`kin-light absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_2px_var(--kin-panel)] ${ZONE_CLASS[zoneOf(rep.peak.degrees)].bg} ${ZONE_CLASS[zoneOf(rep.peak.degrees)].text}`}
                style={{ ...cssVars({ "--i": i }), left: percentX(plot, rep.peak.ms), top: percentY(plot, rep.peak.degrees) }}
                aria-hidden
              />
            ))}
            <span className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full bg-ink shadow-[0_0_8px_var(--kin-shade)]" style={{ left: percentX(plot, ms) }} />
          </>
        }
      >
        <defs>
          <linearGradient id={gradient} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0" y2={CANVAS}>
            <stop offset={cut(TARGET_KNEE[1])} style={{ stopColor: "var(--kin-zone-over)" }} />
            <stop offset={cut(TARGET_KNEE[1])} style={{ stopColor: "var(--kin-zone-target)" }} />
            <stop offset={cut(TARGET_KNEE[0])} style={{ stopColor: "var(--kin-zone-target)" }} />
            <stop offset={cut(TARGET_KNEE[0])} style={{ stopColor: "var(--kin-knee)" }} />
          </linearGradient>
        </defs>
        {zoneSpans(yTicks.at(-1)!.value).map(({ zone: z, from, to }) => (
          <rect key={z} x={0} width={CANVAS} y={plot.y(to)} height={plot.y(from) - plot.y(to)} className={`${ZONE_CLASS[z].softFill} opacity-70`} />
        ))}
        <g className="kin-draw">
          <path className={`${line} stroke-trunk [stroke-width:1.5]`} d={linePath(trunk.map((p) => ({ x: p.ms, y: p.degrees })), plot)} />
          <path className={`${line} [stroke-width:2.5]`} stroke={`url(#${gradient})`} d={linePath(knee.map((p) => ({ x: p.ms, y: p.degrees })), plot)} />
        </g>
      </ChartFrame>

      <div className="grid grid-cols-[2.75rem_1fr]">
        <span />
        <div className="grid grid-cols-5 gap-1 sm:grid-cols-10" role="group" aria-label={c.repetitions}>
          {repetitions.map((rep, i) => {
            const z = ZONE_CLASS[zoneOf(rep.peak.degrees)];
            return (
              <button
                key={rep.startMs}
                type="button"
                className={`kin-light grid min-h-11 min-w-0 place-items-center rounded-control text-xs font-semibold [font-variant-numeric:tabular-nums] transition-transform duration-[var(--kin-motion-hover)] hover:-translate-y-0.5 aria-current:outline-2 aria-current:outline-offset-2 aria-current:outline-ink ${z.soft} ${z.text}`}
                style={cssVars({ "--i": i })}
                aria-current={i === current || undefined}
                aria-label={format(c.repetition, { index: i + 1, risk: t.analysis.risk[rep.level], peak: f.degrees(rep.peak.degrees) })}
                onClick={() => seek(rep.startMs)}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" className="kin-btn kin-btn-primary grid size-11 flex-none place-items-center rounded-full" onClick={togglePlay} aria-label={playing ? c.pause : c.play}>
          <Glyph name={playing ? "pause" : "play"} size={20} />
        </button>
        <input
          type="range"
          className="h-11 w-full min-w-0 cursor-pointer accent-accent"
          min={0}
          max={durationMs}
          step={100}
          value={Math.round(ms)}
          onChange={(event) => seek(Number(event.currentTarget.value))}
          aria-label={c.playhead}
          aria-valuetext={seconds(ms)}
        />
        <output className="min-w-[5.5ch] text-right font-display text-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">{seconds(ms)}</output>
      </div>
    </div>
  );
}
