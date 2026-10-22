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
import { type KneeTarget, type Signal, SIGNAL_CLASS, type Zone, ZONE_CLASS, zoneOf, zoneSpans } from "@/lib/design/signals";
import { format } from "@/lib/i18n";
import { useFormat, useT } from "@/lib/i18n/client";
import { focusJointText } from "@/lib/risk-focus";

/** Qué dibuja cada serie: su nombre y el color de su señal. */
export type Channel = { label: string; signal: Signal };

type Props = {
  /** De lado, la flexión de rodilla; de frente, el valgo de la rodilla izquierda. */
  primary: AngleSample[];
  /** De lado, la inclinación del tronco; de frente, el valgo de la rodilla derecha. */
  secondary: AngleSample[];
  /** Sin canales, las series son la rodilla y el tronco de la vista lateral. */
  channels?: { primary: Channel; secondary: Channel };
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
  fullPrimary?: AngleSample[];
  fullSecondary?: AngleSample[];
};

const line = "fill-none [vector-effect:non-scaling-stroke]";

/**
 * Ángulos a lo largo del video con un cabezal que comparten el escenario, las lecturas y la gráfica.
 * No tiene reloj propio: tocar una repetición o la barra llama a `onSeek` y quien lo usa mueve el cabezal.
 * Las repeticiones con riesgo marcan en la gráfica el instante del pico y dicen qué articulación y qué lado.
 */
export function AngleTimeline({ primary, secondary, channels, repetitions, durationMs, target, zoneNames, ms, playing, onSeek, onTogglePlay, stage, layout = "compact", fullPrimary = primary, fullSecondary = secondary }: Props) {
  const t = useT();
  const c = t.styleGuide.charts;
  const f = useFormat();
  const gradient = useId();
  const series = channels ?? { primary: { label: t.joints.knee_flexion, signal: "knee" }, secondary: { label: t.joints.trunk_inclination, signal: "trunk" } };

  const all = [...primary, ...secondary].map((s) => s.degrees);
  // El valgo puede ser negativo (rodilla hacia afuera): el eje baja de cero solo si hace falta
  const yTicks = niceTicks(Math.min(0, ...all), Math.max(0, ...all, target?.high ?? target?.low ?? 0), 4).map((value) => ({ value, label: f.degrees(value) }));
  const xTicks = niceTicks(0, durationMs, 8).filter((v) => v <= durationMs).map((value) => ({ value, label: `${value / 1000} ${c.seconds}` }));
  const plot = makePlot([0, durationMs], [yTicks[0].value, yTicks.at(-1)!.value]);

  const primaryNow = valueAt(fullPrimary, ms) ?? 0;
  const secondaryNow = valueAt(fullSecondary, ms) ?? 0;
  const zone = target ? zoneOf(primaryNow, target) : null;
  // La marca de cada repetición va en el color de su zona; sin rango, en el de su riesgo
  const mark = (rep: TimelineRepetition) => (target ? ZONE_CLASS[zoneOf(rep.peak.degrees, target)] : { bg: RISK_FILL[rep.level], text: RISK_TEXT[rep.level], soft: RISK_SOFT[rep.level] });
  const current = repetitions.findIndex((rep) => ms >= rep.startMs && ms < rep.endMs);
  const seconds = (value: number) => `${(value / 1000).toFixed(1)} ${c.seconds}`;
  const jointOf = (rep: TimelineRepetition) => (rep.focus ? focusJointText(rep.focus, t.analysis) : "");
  // Lo que se lee bajo los botones: la repetición del cabezal o, fuera de ellas, la primera con riesgo
  const shown = repetitions[current]?.focus ? current : repetitions.findIndex((rep) => rep.focus);
  const shownFocus = repetitions[shown]?.focus;
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
            <dt className="flex items-center gap-2 text-sm text-ink-muted"><span className={`h-1 w-5 rounded-full ${SIGNAL_CLASS[series.primary.signal].bg}`} aria-hidden />{series.primary.label}</dt>
            <dd className={`font-display text-3xl font-semibold ${SIGNAL_CLASS[series.primary.signal].text} [font-variant-numeric:tabular-nums]`}>{f.degrees(primaryNow)}</dd>
            {zone && <dd><ZoneChip zone={zone} label={zoneNames[zone]} /></dd>}
          </div>
          <div className="kin-well grid gap-1 p-4">
            <dt className="flex items-center gap-2 text-sm text-ink-muted"><span className={`h-1 w-5 rounded-full ${SIGNAL_CLASS[series.secondary.signal].bg}`} aria-hidden />{series.secondary.label}</dt>
            <dd className={`font-display text-3xl font-semibold ${SIGNAL_CLASS[series.secondary.signal].text} [font-variant-numeric:tabular-nums]`}>{f.degrees(secondaryNow)}</dd>
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
            {repetitions.map((rep) =>
              rep.focus ? (
                <span
                  key={`focus-${rep.startMs}`}
                  className={`pointer-events-none absolute inset-y-0 w-0 -translate-x-1/2 border-l-2 border-dashed border-current opacity-80 ${RISK_TEXT[rep.level]}`}
                  style={{ left: percentX(plot, rep.focus.ms) }}
                  aria-hidden
                />
              ) : null,
            )}
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
        {yTicks[0].value < 0 && <line x1={0} x2={CANVAS} y1={plot.y(0)} y2={plot.y(0)} className="stroke-line-strong [stroke-width:1] [vector-effect:non-scaling-stroke]" />}
        <g className="kin-draw">
          <path className={`${line} ${SIGNAL_CLASS[series.secondary.signal].stroke} [stroke-width:1.5]`} d={linePath(secondary.map((p) => ({ x: p.ms, y: p.degrees })), plot)} />
          <path className={`${line} [stroke-width:2.5]`} stroke={stops.length ? `url(#${gradient})` : `var(--kin-${series.primary.signal})`} d={linePath(primary.map((p) => ({ x: p.ms, y: p.degrees })), plot)} />
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
                aria-label={
                  rep.focus
                    ? format(c.repetitionFocus, { index: i + 1, risk: t.analysis.risk[rep.level], joint: jointOf(rep), time: seconds(rep.focus.ms) })
                    : format(c.repetition, { index: i + 1, risk: t.analysis.risk[rep.level], peak: f.degrees(rep.peak.degrees) })
                }
                // Con riesgo voy al instante del pico: ahí se dibuja el esqueleto con la articulación marcada
                onClick={() => onSeek(rep.focus?.ms ?? rep.startMs)}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
      {shownFocus && (
        <p className={`kin-well flex items-center gap-2 p-3 text-sm font-semibold ${RISK_TEXT[repetitions[shown].level]}`} aria-live="polite">
          <Glyph name="alert" size={18} className="flex-none" />
          <span className="text-ink">
            {format(t.analysisDetail.focusAt, {
              index: shown + 1,
              joint: jointOf(repetitions[shown]),
              degrees: shownFocus.degrees === null ? "—" : f.degrees(shownFocus.degrees),
              time: seconds(shownFocus.ms),
            })}
          </span>
        </p>
      )}

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
