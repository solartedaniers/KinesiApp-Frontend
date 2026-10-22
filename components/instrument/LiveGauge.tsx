"use client";

import { useEffect, useMemo, useState } from "react";

import { Dial } from "./Dial";
import { PoseFigure } from "./PoseFigure";
import { ZoneChip } from "./Status";

import { squatPoseAt } from "@/lib/design/pose";
import { type AngleSample, valueAt } from "@/lib/analysis-timeline";
import { type KneeTarget, targetText, zoneOf } from "@/lib/design/signals";
import { format } from "@/lib/i18n";
import { useFormat, useT } from "@/lib/i18n/client";
import type { MovementType } from "@/lib/types";

// Espero a que la aguja termine su barrido de entrada y arranco desde el pico, donde quedó
const START_DELAY_MS = 1800;

/**
 * Lectura en vivo de una repetición. El servidor y el primer render muestran el pico (la versión
 * quieta); después, si no se pidió menos movimiento, requestAnimationFrame recorre las muestras.
 */
export function LiveGauge({ samples, target, movement }: { samples: AngleSample[]; target: KneeTarget; movement: MovementType }) {
  const dictionary = useT();
  const t = dictionary.styleGuide;
  const zoneNames = dictionary.analysis.kneeZones[movement];
  const targetLabel = dictionary.analysis.kneeTarget;
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
      setMs((top.ms + now - start) % duration);
      frame = requestAnimationFrame(tick);
    };
    const wait = setTimeout(() => (frame = requestAnimationFrame(tick)), START_DELAY_MS);
    return () => {
      clearTimeout(wait);
      cancelAnimationFrame(frame);
    };
  }, [samples, top]);

  const value = ms === null ? top.degrees : (valueAt(samples, ms) ?? 0);
  // El pico se guarda dentro de la repetición y vuelve a cero cuando empieza otra
  const peak = ms === null ? top.degrees : Math.max(...samples.filter((s) => s.ms <= ms).map((s) => s.degrees));
  const label = format(t.hero.dial, { value: f.degrees(top.degrees), peak: f.degrees(top.degrees), range: targetText(target, f.degrees, targetLabel) });

  return (
    <div className="grid items-center gap-5 sm:grid-cols-[minmax(0,1fr)_10rem]">
      <div className="grid gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink-muted"><span className="h-1 w-5 rounded-full bg-knee shadow-[0_0_8px_var(--kin-knee)]" aria-hidden />{t.hero.reading}</p>
        <Dial value={value} peak={peak} target={target} labels sweep={ms === null} label={label} className="mx-auto w-full max-w-[22rem]">
          <span className="font-display text-hero font-semibold text-knee [font-variant-numeric:tabular-nums]" aria-hidden>{f.degrees(value)}</span>
          <ZoneChip zone={zoneOf(value, target)} label={zoneNames[zoneOf(value, target)]} />
        </Dial>
      </div>
      <div className="kin-well grid gap-3 p-3">
        <svg viewBox="-42 -108 92 116" className="mx-auto h-40 w-auto" role="img" aria-label={t.hero.skeleton}>
          <line x1="-42" x2="50" y1="0" y2="0" className="stroke-line-strong" strokeWidth="0.8" />
          <PoseFigure keypoints={squatPoseAt(value)} />
        </svg>
        <dl className="grid grid-cols-2 gap-2 text-xs text-ink-muted sm:grid-cols-1">
          <div>
            <dt>{t.hero.peak}</dt>
            <dd className="font-display text-xl font-semibold text-ink [font-variant-numeric:tabular-nums]">{f.degrees(peak)}</dd>
          </div>
          <div>
            <dt>{t.hero.target}</dt>
            <dd className="font-display text-xl font-semibold text-zone-target [font-variant-numeric:tabular-nums]">{targetText(target, f.degrees, targetLabel)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
