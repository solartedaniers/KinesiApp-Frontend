"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button, ButtonLink } from "./Button";
import { MovementPicker } from "./MovementPicker";
import { PoseFigure } from "./PoseFigure";
import { SimulatedAnalysis } from "./SimulatedAnalysis";
import { Notice } from "./Status";

import { dialArc } from "@/lib/charts/dial";
import { VIDEO_MAX_SECONDS } from "@/lib/config";
import { squatPoseAt } from "@/lib/design/pose";
import { format } from "@/lib/i18n";
import { useFormat, useT } from "@/lib/i18n/client";
import { ROUTES } from "@/lib/routes";

// En la guía la grabación corre cuatro veces más rápido: el tope de 40 s se ve en 10 s reales
const SIMULATED_SPEED = 4;
// Una sentadilla simulada cada 4 s de video
const REPETITION_MS = 4000;
const C = { x: 50, y: 50 };

type Phase = "idle" | "recording" | "stopped" | "analyzing" | "done";

/**
 * Captura simulada: misma secuencia que la real (elegir movimiento, grabar, tope automático, subir y
 * analizar), sin pedir la cámara. El tope es el de la configuración, no un número suelto.
 */
export function CaptureSimulator() {
  const t = useT();
  const f = useFormat();
  const c = t.styleGuide.screens.capture;
  const [phase, setPhase] = useState<Phase>("idle");
  const [ms, setMs] = useState(0);
  const [autoStopped, setAutoStopped] = useState(false);
  const limitMs = VIDEO_MAX_SECONDS * 1000;
  const stopRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (phase !== "recording") return;
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const elapsed = Math.min(limitMs, (now - start) * SIMULATED_SPEED);
      setMs(elapsed);
      if (elapsed < limitMs) {
        frame = requestAnimationFrame(tick);
        return;
      }
      setAutoStopped(true);
      setPhase("stopped");
    });
    return () => cancelAnimationFrame(frame);
  }, [phase, limitMs]);

  // Llevo el foco al botón de detener para que el teclado siga donde está la acción
  useEffect(() => {
    if (phase === "recording") stopRef.current?.focus();
  }, [phase]);

  const record = () => {
    setMs(0);
    setAutoStopped(false);
    setPhase("recording");
  };
  const finish = useCallback(() => setPhase("done"), []);

  const seconds = Math.floor(ms / 1000);
  const knee = phase === "recording" ? Math.abs(Math.sin((ms / REPETITION_MS) * Math.PI)) * 108 : 0;
  const fill = ms / limitMs;

  if (phase === "analyzing" || phase === "done") {
    return (
      <div data-theme="dark" className="kin-card kin-tinted grid gap-6 p-5 sm:p-8">
        <SimulatedAnalysis replay={false} onDone={finish} />
        {phase === "done" && <ButtonLink href={ROUTES.styleGuideScreen("analysis")} glyph="chevronRight" className="justify-self-start">{t.styleGuide.screens.home.openAnalysis}</ButtonLink>}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="grid content-start gap-5">
        <MovementPicker
          legend={t.styleGuide.components.movementLegend}
          name="capture-movement"
          defaultValue="squat"
          options={[
            { value: "jump", label: t.analysis.movement.jump, hint: t.styleGuide.components.jumpHint },
            { value: "squat", label: t.analysis.movement.squat, hint: t.styleGuide.components.squatHint },
          ]}
        />
        <Notice tone="info">{t.styleGuide.components.info}</Notice>
        <p className="text-sm text-ink-muted">{c.simulated}</p>
      </div>

      <div className="grid content-start gap-4">
        <figure data-theme="dark" className="kin-stage mx-auto aspect-[3/4] w-full max-w-md rounded-stage text-on-stage">
          <svg viewBox="-60 -128 126 150" className="absolute inset-0 size-full" role="img" aria-label={c.frame}>
            {/* Esquinas de encuadre: marcan dónde debe quedar el cuerpo entero */}
            <path d="M-44 -114h-10v10M50 -114h10v10M-44 8h-10v-10M50 8h10v-10" className="fill-none stroke-on-stage opacity-60" strokeWidth="1.2" />
            <line x1="-54" x2="60" y1="0" y2="0" className="stroke-line-strong" strokeWidth="0.8" />
            <PoseFigure keypoints={squatPoseAt(knee)} center={phase === "recording"} />
          </svg>
          <figcaption className="absolute inset-x-0 bottom-0 px-4 pb-3 text-center text-xs text-on-stage opacity-90">{c.frameHint}</figcaption>
          <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-stage/80 px-2.5 py-1 text-xs font-semibold">
            {phase === "recording" && <span className="kin-waking size-2.5 rounded-full bg-zone-over text-zone-over" aria-hidden />}
            <span>{phase === "recording" ? c.recording : format(c.limit, { seconds: VIDEO_MAX_SECONDS })}</span>
          </div>
          <div className="absolute top-3 right-3 grid size-16 place-items-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0" aria-hidden>
              <circle cx="50" cy="50" r="42" className="fill-stage stroke-line" strokeWidth="8" />
              {fill > 0 && <path d={dialArc(C, 42, 0, Math.min(fill, 0.999), 1, 360)} transform="rotate(180 50 50)" className={`kin-signal-glow fill-none ${fill >= 1 ? "stroke-zone-over" : "stroke-trunk"} text-trunk`} strokeWidth="8" strokeLinecap="round" />}
            </svg>
            <span className="relative font-display text-lg font-bold [font-variant-numeric:tabular-nums]" role="timer" aria-live="off">{seconds}</span>
          </div>
        </figure>

        {autoStopped && <Notice tone="warning">{format(c.autoStopped, { seconds: VIDEO_MAX_SECONDS })}</Notice>}

        <div className="flex flex-wrap items-center justify-center gap-3">
          {phase === "idle" && <Button glyph="capture" onClick={record} className="min-w-40">{c.record}</Button>}
          {phase === "recording" && (
            <Button ref={stopRef} variant="secondary" glyph="pause" onClick={() => setPhase("stopped")} className="min-w-40">{`${c.stop} · ${f.secondsFromMs(ms)}`}</Button>
          )}
          {phase === "stopped" && (
            <>
              <Button glyph="upload" onClick={() => setPhase("analyzing")}>{c.upload}</Button>
              <Button variant="secondary" glyph="capture" onClick={record}>{c.again}</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
