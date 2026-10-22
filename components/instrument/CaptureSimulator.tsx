"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button, ButtonLink } from "./Button";
import { CaptureFrame } from "./CaptureFrame";
import { MovementPicker } from "./MovementPicker";
import { PoseFigure } from "./PoseFigure";
import { SimulatedAnalysis } from "./SimulatedAnalysis";
import { Notice } from "./Status";

import { squatPoseAt } from "@/lib/design/pose";
import { format } from "@/lib/i18n";
import { useFormat, useT } from "@/lib/i18n/client";
import { ROUTES } from "@/lib/routes";

// En la guía la grabación corre cuatro veces más rápido: un tope de 40 s se ve en 10 s reales
const SIMULATED_SPEED = 4;
// Una sentadilla simulada cada 4 s de video
const REPETITION_MS = 4000;

type Phase = "idle" | "recording" | "stopped" | "analyzing" | "done";

/**
 * Captura simulada: misma secuencia que la real (elegir movimiento, grabar, tope automático, subir y
 * analizar), sin pedir la cámara. El tope llega de GetClientPolicy.
 */
export function CaptureSimulator({ maxSeconds }: { maxSeconds: number }) {
  const t = useT();
  const f = useFormat();
  const c = t.styleGuide.screens.capture;
  const [phase, setPhase] = useState<Phase>("idle");
  const [ms, setMs] = useState(0);
  const [autoStopped, setAutoStopped] = useState(false);
  const limitMs = maxSeconds * 1000;
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
        <CaptureFrame label={c.frame} hint={c.frameHint} status={phase === "recording" ? c.recording : format(c.limit, { seconds: maxSeconds })} recording={phase === "recording"} fill={fill} value={seconds}>
          <svg viewBox="-60 -128 126 150" className="absolute inset-0 size-full" role="img" aria-label={c.frame}>
            <line x1="-54" x2="60" y1="0" y2="0" className="stroke-line-strong" strokeWidth="0.8" />
            <PoseFigure keypoints={squatPoseAt(knee)} center={phase === "recording"} />
          </svg>
        </CaptureFrame>

        {autoStopped && <Notice tone="warning">{format(c.autoStopped, { seconds: maxSeconds })}</Notice>}

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
