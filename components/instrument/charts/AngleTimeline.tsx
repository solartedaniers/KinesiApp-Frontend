"use client";

import { type ReactNode, useId } from "react";

import { CANVAS, ChartFrame, linePath, makePlot, percentX, percentY } from "./ChartFrame";
import { Glyph } from "../Glyph";
import { ZoneChip } from "../Status";

import { niceTicks } from "@/lib/charts/scale";
import { cssVars } from "@/lib/design/css";
import { RISK_FILL, RISK_SOFT, RISK_TEXT } from "@/lib/design/risk";
import { type AngleSample, type TimelineRepetition, valueAt } from "@/lib/analysis-timeline";

export type { TimelineRepetition };
import { type KneeTarget, SIGNAL_CLASS, type Zone, ZONE_CLASS, zoneOf, zoneSpans } from "@/lib/design/signals";
import { format } from "@/lib/i18n";
import { useFormat, useT } from "@/lib/i18n/client";


type Props = {
  knee: AngleSample[];
  trunk: AngleSample[];
  repetitions: TimelineRepetition[];
  durationMs: number;
  /** Rango sin riesgo del análisis; sin él no hay zonas y cada repetición lleva el color de su riesgo. */
  target: KneeTarget | null;
  zoneNames: Record<Zone, string>;
  /** Instante del cabezal: lo mueve quien tiene el reloj (el <video> en la app, una simulación en la guía). */
  ms: number;
  playing: boolean;
  onSeek: (ms: number) => void;
  onTogglePlay: () => void;
  /** Lo que se ve en el escenario: el video o el esqueleto simulado. */
  stage: ReactNode;
  /** "video" le da el ancho al escenario; "compact" es el de la guía. */
  layout?: "compact" | "video";
  /** Series completas para leer el instante exacto; las dibujadas están reducidas. */
  fullKnee?: AngleSample[];
  fullTrunk?: AngleSample[];
};

const line = "fill-none [vector-effect:non-scaling-stroke]";

/**
 * Ángulos a lo largo del video con un cabezal que comparten el escenario, las lecturas y la gráfica.
 * No tiene reloj propio: tocar una repetición o la barra llama a `onSeek` y quien lo usa mueve el cabezal.
 */
export function AngleTimeline({ knee, trunk, repetitions, durationMs, target, zoneNames, ms, playing, onSeek, onTogglePlay, stage, layout = "compact", fullKnee = knee, fullTrunk = trunk }: Props) {
  const t = useT();
  const c = t.styleGuide.charts;
  const f = useFormat();
  const gradient = useId();

  const top = Math.max(...knee.map((s) => s.degrees), target?.high ?? target?.low ?? 0);
  const yTicks = niceTicks(0, top, 4).map((value) => ({ value, label: f.degrees(value) }));
  const xTicks = niceTicks(0, durationMs, 8).filter((v) => v <= durationMs).map((value) => ({ value, label: `${value / 1000} ${c.seconds}` }));
  const plot = makePlot([0, durationMs], [0, yTicks.at(-1)!.value]);

  const kneeNow = valueAt(fullKnee, ms) ?? 0;
  const trunkNow = valueAt(fullTrunk, ms) ?? 0;
  const zone = target ? zoneOf(kneeNow, target) : null;
  // La marca de cada repetición va en el color de su zona; sin rango, en el de su riesgo
  const mark = (rep: TimelineRepetition) => (target ? ZONE_CLASS[zoneOf(rep.peak.degrees, target)] : { bg: RISK_FILL[rep.level], text: RISK_TEXT[rep.level], soft: RISK_SOFT[rep.level] });
  const current = repetitions.findIndex((rep) => ms >= rep.startMs && ms < rep.endMs);
  const seconds = (value: number) => `${(value / 1000).toFixed(1)} ${c.seconds}`;
  // Cortes del degradado en el lienzo: la rodilla lleva su color y se enciende en verde o rosa al entrar
  // en el objetivo o pasarse, justo donde cruza cada zona
  const cut = (degrees: number) => plot.y(degrees) / CANVAS;
  const stops: (readonly [number, string])[] = target
    ? [
        ...(target.high !== null ? ([[cut(target.high), "var(--kin-zone-over)"], [cut(target.high), "var(--kin-zone-target)"]] as const) : []),
        ...(target.low !== null ? ([[cut(target.low), "var(--kin-zone-target)"], [cut(target.low), "var(--kin-knee)"]] as const) : []),
      ]
    : [];

  return (
    <div className="grid gap-5">
      <div className={layout === "video" ? "grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem]" : "grid gap-4 sm:grid-cols-[13rem_1fr] sm:items-stretch"}>
        {stage}
        <dl className={`grid content-center gap-4 ${layout === "video" ? "grid-cols-2 lg:grid-cols-1" : "sm:grid-cols-2"}`}>
          <div className="kin-well grid gap-1 p-4">
            <dt className="flex items-center gap-2 text-sm text-ink-muted"><span className={`h-1 w-5 rounded-full ${SIGNAL_CLASS.knee.bg}`} aria-hidden />{t.joints.knee_flexion}</dt>
            <dd className="font-display text-3xl font-semibold text-knee [font-variant-numeric:tabular-nums]">{f.degrees(kneeNow)}</dd>
            {zone && <dd><ZoneChip zone={zone} label={zoneNames[zone]} /></dd>}
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
                className={`kin-light absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_2px_var(--kin-panel)] ${mark(rep).bg} ${mark(rep).text}`}
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
            {stops.map(([offset, color], i) => <stop key={i} offset={offset} style={{ stopColor: color }} />)}
          </linearGradient>
        </defs>
        {target && zoneSpans(yTicks.at(-1)!.value, target).map(({ zone: z, from, to }) => (
          <rect key={z} x={0} width={CANVAS} y={plot.y(to)} height={plot.y(from) - plot.y(to)} className={`${ZONE_CLASS[z].softFill} opacity-70`} />
        ))}
        <g className="kin-draw">
          <path className={`${line} stroke-trunk [stroke-width:1.5]`} d={linePath(trunk.map((p) => ({ x: p.ms, y: p.degrees })), plot)} />
          <path className={`${line} [stroke-width:2.5]`} stroke={stops.length ? `url(#${gradient})` : "var(--kin-knee)"} d={linePath(knee.map((p) => ({ x: p.ms, y: p.degrees })), plot)} />
        </g>
      </ChartFrame>

      <div className="grid grid-cols-[2.75rem_1fr] px-2 sm:px-3.5">
        <span />
        <div className="grid grid-cols-5 gap-1 sm:grid-cols-10" role="group" aria-label={c.repetitions}>
          {repetitions.map((rep, i) => {
            const z = mark(rep);
            return (
              <button
                key={rep.startMs}
                type="button"
                className={`kin-light grid min-h-11 min-w-0 place-items-center rounded-control text-xs font-semibold [font-variant-numeric:tabular-nums] transition-transform duration-[var(--kin-motion-hover)] hover:-translate-y-0.5 aria-current:outline-2 aria-current:outline-offset-2 aria-current:outline-ink ${z.soft} ${z.text}`}
                style={cssVars({ "--i": i })}
                aria-current={i === current || undefined}
                aria-label={format(c.repetition, { index: i + 1, risk: t.analysis.risk[rep.level], peak: f.degrees(rep.peak.degrees) })}
                onClick={() => onSeek(rep.startMs)}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" className="kin-btn kin-btn-primary grid size-11 flex-none place-items-center rounded-full" onClick={onTogglePlay} aria-label={playing ? c.pause : c.play}>
          <Glyph name={playing ? "pause" : "play"} size={20} />
        </button>
        <input
          type="range"
          className="h-11 w-full min-w-0 cursor-pointer accent-accent"
          min={0}
          max={durationMs}
          step={100}
          value={Math.round(ms)}
          onChange={(event) => onSeek(Number(event.currentTarget.value))}
          aria-label={c.playhead}
          aria-valuetext={seconds(ms)}
        />
        <output className="min-w-[5.5ch] text-right font-display text-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">{seconds(ms)}</output>
      </div>
    </div>
  );
}
