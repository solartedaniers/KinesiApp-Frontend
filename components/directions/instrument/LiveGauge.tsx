"use client";

import { useEffect, useMemo, useState } from "react";

import { Dial } from "./Dial";

import { BONES, type Point, squatPoseAt } from "@/lib/design/pose";
import { type AngleSample, valueAt } from "@/lib/design/sample-analysis";
import { useFormat } from "@/lib/i18n/client";

type Labels = { reading: string; peak: string; target: string; skeleton: string };

const ARC = 10;
const r = (n: number) => Math.round(n * 10) / 10;

/** Arco de la flexión en la rodilla: entre la prolongación de la pierna y el muslo. */
function flexionArc(ankle: Point, knee: Point, hip: Point): string {
  const unit = (from: Point, to: Point) => {
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    return { x: (to.x - from.x) / length, y: (to.y - from.y) / length };
  };
  const extension = unit(ankle, knee);
  const thigh = unit(knee, hip);
  const start = { x: knee.x + extension.x * ARC, y: knee.y + extension.y * ARC };
  const end = { x: knee.x + thigh.x * ARC, y: knee.y + thigh.y * ARC };
  const sweep = extension.x * thigh.y - extension.y * thigh.x > 0 ? 1 : 0;
  return `M${r(knee.x)} ${r(knee.y)}L${r(start.x)} ${r(start.y)}A${ARC} ${ARC} 0 0 ${sweep} ${r(end.x)} ${r(end.y)}Z`;
}

/**
 * Lectura en vivo de una repetición. El servidor y el primer render muestran el pico (la versión
 * quieta); después, si no se pidió menos movimiento, requestAnimationFrame recorre las muestras.
 */
export function LiveGauge({ samples, target, labels }: { samples: AngleSample[]; target: [number, number]; labels: Labels }) {
  const f = useFormat();
  const [ms, setMs] = useState<number | null>(null);
  const top = useMemo(() => samples.reduce((best, s) => (s.degrees > best.degrees ? s : best)), [samples]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const duration = samples.at(-1)!.ms;
    let frame = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      start ??= now;
      setMs((now - start) % duration);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [samples]);

  const value = ms === null ? top.degrees : (valueAt(samples, ms) ?? 0);
  // El pico se guarda dentro de la repetición y vuelve a cero cuando empieza otra
  const peak = ms === null ? top.degrees : Math.max(...samples.filter((s) => s.ms <= ms).map((s) => s.degrees));
  const pose = squatPoseAt(value);

  return (
    <div className="grid items-center gap-5 sm:grid-cols-[minmax(0,1fr)_9.5rem]">
      <div>
        <Dial value={value} peak={peak} target={target} labels className="w-full" />
        <p className="mt-1 text-center" aria-hidden>
          <span className="block font-display text-5xl leading-none font-semibold [font-variant-numeric:tabular-nums] sm:text-6xl">{f.degrees(value)}</span>
        </p>
        <p className="visually-hidden">{`${labels.peak}: ${f.degrees(top.degrees)}`}</p>
      </div>
      <div className="instrument-inset grid gap-3 rounded-[1rem] bg-sunken p-3">
        <svg viewBox="-42 -108 92 116" className="mx-auto h-40 w-auto" role="img" aria-label={labels.skeleton}>
          <line x1="-42" x2="50" y1="0" y2="0" className="stroke-line-strong" strokeWidth="0.8" />
          <path d={flexionArc(pose.ankle, pose.knee, pose.hip)} className="fill-accent-soft stroke-accent" strokeWidth="1" />
          <g className="instrument-body">
            <path d={BONES.map(([a, b]) => `M${r(pose[a].x)} ${r(pose[a].y)}L${r(pose[b].x)} ${r(pose[b].y)}`).join("")} />
            <circle cx={r(pose.head.x)} cy={r(pose.head.y)} r="5" />
            <circle cx={r(pose.knee.x)} cy={r(pose.knee.y)} r="2.4" className="instrument-joint" />
          </g>
        </svg>
        <dl className="grid gap-2 text-xs text-ink-muted">
          <div><dt>{labels.peak}</dt><dd className="font-display text-base font-semibold text-ink [font-variant-numeric:tabular-nums]">{f.degrees(peak)}</dd></div>
          <div><dt>{labels.target}</dt><dd className="font-display text-base font-semibold text-ink [font-variant-numeric:tabular-nums]">{`${target[0]}–${f.degrees(target[1])}`}</dd></div>
        </dl>
      </div>
    </div>
  );
}
