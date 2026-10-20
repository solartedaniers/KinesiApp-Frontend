"use client";

import { useEffect, useRef, useState } from "react";

import { ANALYSIS_STAGES, AnalysisProgress } from "./AnalysisProgress";
import { Button } from "./Button";
import { Glyph } from "./Glyph";

import { useT } from "@/lib/i18n/client";

// Duración simulada de cada etapa en la guía; en la app las marca el stream de WatchAnalysis
const STAGE_MS = [900, 1600, 3600, 3000, 1500];

const now = () => performance.now();

/** Progreso simulado para la guía y la pantalla de captura. Con `onDone` avisa cuando termina. */
export function SimulatedAnalysis({ replay = true, onDone }: { replay?: boolean; onDone?: () => void }) {
  const t = useT().styleGuide.progress;
  const [run, setRun] = useState(0);
  const [state, setState] = useState({ stage: 0, fraction: 0 });
  const [visible, setVisible] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // Arranco cuando se ve: en la guía queda lejos del inicio y terminaría antes de que alguien llegue
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), { threshold: 0.4 });
    observer.observe(root.current!);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const start = now();
    let frame = requestAnimationFrame(function tick() {
      let elapsed = now() - start;
      let stage = 0;
      while (stage < STAGE_MS.length && elapsed >= STAGE_MS[stage]) elapsed -= STAGE_MS[stage++];
      setState({ stage, fraction: stage < STAGE_MS.length ? elapsed / STAGE_MS[stage] : 0 });
      if (stage < STAGE_MS.length) frame = requestAnimationFrame(tick);
      else onDone?.();
    });
    return () => cancelAnimationFrame(frame);
  }, [run, visible, onDone]);

  const labels = { title: t.label, stage: t.stage, stageNames: t.stages, done: t.done };
  return (
    <div ref={root} className="grid items-center gap-6 md:grid-cols-[minmax(0,20rem)_1fr]">
      <AnalysisProgress stage={state.stage} fraction={state.fraction} labels={labels} />
      <div className="grid gap-4">
        <ol className="grid gap-1.5">
          {ANALYSIS_STAGES.map((name, i) => {
            const status = i < state.stage ? "done" : i === state.stage ? "current" : "pending";
            return (
              <li key={name} className={`flex min-h-9 items-center gap-3 rounded-panel px-3 text-sm ${status === "current" ? "kin-well font-semibold text-ink" : status === "done" ? "text-ink" : "text-ink-muted"}`} aria-current={status === "current" ? "step" : undefined}>
                <span className={`grid size-6 flex-none place-items-center rounded-full ${status === "done" ? "bg-zone-target-soft text-zone-target" : status === "current" ? "bg-accent-soft text-accent" : "bg-sunken"}`} aria-hidden>
                  {status === "done" ? <Glyph name="check" size={14} /> : <span className={`size-1.5 rounded-full ${status === "current" ? "kin-waking bg-accent text-accent" : "bg-line-strong"}`} />}
                </span>
                {t.stages[name]}
              </li>
            );
          })}
        </ol>
        {state.stage >= ANALYSIS_STAGES.length && <p className="font-display text-xl font-semibold text-zone-target" role="status">{t.done}</p>}
        {replay && (
          <Button variant="secondary" glyph="play" className="justify-self-start" onClick={() => setRun((n) => n + 1)}>{t.replay}</Button>
        )}
      </div>
    </div>
  );
}
