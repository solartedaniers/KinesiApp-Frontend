"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button, buttonClasses } from "@/components/instrument/Button";
import { CaptureFrame } from "@/components/instrument/CaptureFrame";
import { MovementPicker } from "@/components/instrument/MovementPicker";
import { Notice } from "@/components/instrument/Status";
import { confirmVideoUpload, startVideoUpload } from "@/lib/actions/analyses";
import { useWakeAi } from "@/lib/ai-status/use-ai-status";
import { codeMessage } from "@/lib/errors";
import { format } from "@/lib/i18n";
import { useFormat, useT } from "@/lib/i18n/client";
import { analysisPath } from "@/lib/routes";
import { MOVEMENT_TYPES, type MovementType } from "@/lib/types";
import { type BucketUpload, bytesToMegabytes, readVideoMetadata, UPLOAD_ABORTED_CODE, uploadToBucket, validateVideoFile, type VideoMetadata } from "@/lib/video-upload";

// Contenedores que prueba MediaRecorder, en orden: MP4 donde exista (Safari) y si no WebM
const RECORDER_TYPES = ["video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
// 720 px es el lado que analiza la IA (ANALYSIS_MAX_FRAME_SIDE_PX): grabar más solo pesa más
const CAMERA: MediaStreamConstraints = { video: { facingMode: "environment", height: { ideal: 720 } }, audio: false };

type Phase = "idle" | "live" | "recording" | "ready" | "uploading" | "confirming";
type Clip = { file: Blob; url: string; meta: VideoMetadata | null; type: string };

/**
 * Captura real con el mismo escenario de la guía. La cámara graba con MediaRecorder y se detiene sola
 * en el tope; también se puede elegir un video guardado. Un Web Worker lee la duración, la resolución
 * y el formato antes de subir; después, URL firmada → PUT directo al bucket → confirmación → resultado,
 * donde sigue el progreso en vivo.
 */
export function CaptureFlow({ athleteId, maxBytes, maxSeconds }: { athleteId: string; maxBytes: number; maxSeconds: number }) {
  const t = useT();
  const c = t.capture;
  const f = useFormat();
  const router = useRouter();
  // Despierto la IA ya: arranca mientras el deportista elige el movimiento y graba
  useWakeAi();
  const [movement, setMovement] = useState<MovementType>("squat");
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [autoStopped, setAutoStopped] = useState(false);
  const [clip, setClip] = useState<Clip | null>(null);
  const [fraction, setFraction] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const live = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const upload = useRef<BucketUpload | null>(null);
  const stopRef = useRef<HTMLButtonElement>(null);
  const limitMs = maxSeconds * 1000;

  // Al salir apago la cámara, libero el video en memoria y corto una subida a medias
  useEffect(
    () => () => {
      stream.current?.getTracks().forEach((track) => track.stop());
      upload.current?.abort();
    },
    [],
  );
  useEffect(() => () => void (clip && URL.revokeObjectURL(clip.url)), [clip]);

  // El <video> en vivo aparece al pasar a "live": recién ahí existe para darle el stream
  useEffect(() => {
    if (live.current && live.current.srcObject !== stream.current) live.current.srcObject = stream.current;
  }, [phase]);

  useEffect(() => {
    if (phase !== "recording") return;
    stopRef.current?.focus();
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const elapsed = Math.min(limitMs, now - start);
      setElapsedMs(elapsed);
      if (elapsed < limitMs) frame = requestAnimationFrame(tick);
      else {
        setAutoStopped(true);
        recorder.current?.stop();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [phase, limitMs]);

  async function openCamera() {
    setError(null);
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices) return setError(c.noRecorder);
    try {
      stream.current = await navigator.mediaDevices.getUserMedia(CAMERA);
    } catch {
      return setError(c.cameraDenied);
    }
    setClip(null);
    setPhase("live");
  }

  function record() {
    if (!stream.current) return;
    const type = RECORDER_TYPES.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? "";
    const chunks: Blob[] = [];
    const media = new MediaRecorder(stream.current, type ? { mimeType: type } : undefined);
    const started = performance.now();
    media.ondataavailable = (event) => event.data.size && chunks.push(event.data);
    media.onstop = () => {
      const recordedType = (media.mimeType || type || "video/webm").split(";")[0];
      void accept(new Blob(chunks, { type: recordedType }), recordedType, Math.min(limitMs, performance.now() - started));
    };
    recorder.current = media;
    setAutoStopped(false);
    setElapsedMs(0);
    media.start();
    setPhase("recording");
  }

  async function accept(file: Blob, type: string, recordedMs?: number) {
    setError(null);
    const invalid = validateVideoFile({ type, size: file.size }, maxBytes);
    if (invalid) {
      setPhase(stream.current ? "live" : "idle");
      return setError(format(c.errors[invalid], { max: bytesToMegabytes(maxBytes) }));
    }
    const meta = await readVideoMetadata(file, recordedMs);
    setClip({ file, url: URL.createObjectURL(file), meta, type });
    setPhase("ready");
    if (!meta) setError(c.errors.videoUnreadable);
    else if (meta.durationMs > limitMs) setError(format(c.errors.videoTooLong, { seconds: Math.ceil(meta.durationMs / 1000), max: maxSeconds }));
  }

  async function send() {
    if (!clip?.meta || clip.meta.durationMs > limitMs) return;
    setError(null);
    setFraction(0);
    setPhase("uploading");
    const fail = (message: string | null) => {
      setPhase("ready");
      setError(message);
    };
    const started = await startVideoUpload({ athleteId, movementType: movement, contentType: clip.type, size: clip.file.size, durationMs: clip.meta.durationMs });
    if ("error" in started) return fail(started.error);
    upload.current = uploadToBucket(started.target, clip.file, setFraction);
    const outcome = await upload.current.done;
    upload.current = null;
    if (!outcome.ok) return fail(outcome.code === UPLOAD_ABORTED_CODE ? null : codeMessage(t, outcome.code));
    setPhase("confirming");
    const confirmed = await confirmVideoUpload(started.target.upload_id);
    if ("error" in confirmed) return fail(confirmed.error);
    stream.current?.getTracks().forEach((track) => track.stop());
    router.push(analysisPath(confirmed.analysisId));
  }

  const busy = phase === "uploading" || phase === "confirming";
  const status = phase === "recording" ? c.recording : busy ? (phase === "confirming" ? c.confirming : c.uploading) : format(c.limit, { seconds: maxSeconds });
  const ring = busy ? { fill: fraction, value: Math.round(fraction * 100) } : { fill: elapsedMs / limitMs, value: Math.floor(elapsedMs / 1000) };
  const meta = clip?.meta;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="grid content-start gap-5">
        <div onChange={(event) => setMovement((event.target as HTMLInputElement).value as MovementType)}>
          <MovementPicker
            legend={c.movementLegend}
            name="movement_type"
            defaultValue={movement}
            options={MOVEMENT_TYPES.map((value) => ({ value, label: t.analysis.movement[value], hint: c.hints[value] }))}
          />
        </div>
        <Notice tone="info" live={false}>{c.setup}</Notice>
        {meta && (
          <section aria-labelledby="capture-details" className="grid gap-2">
            <h2 id="capture-details" className="text-sm font-semibold text-ink">{c.details}</h2>
            <dl className="grid grid-cols-2 gap-3">
              {[
                [c.duration, f.secondsFromMs(meta.durationMs)],
                [c.resolution, meta.width ? `${meta.width} × ${meta.height}` : "—"],
                [c.container, (meta.container ?? clip.type.split("/")[1]).toUpperCase()],
                [c.size, `${(clip.file.size / (1024 * 1024)).toFixed(1)} MB`],
              ].map(([label, value]) => (
                <div key={label} className="kin-well grid gap-0.5 p-3">
                  <dt className="text-xs text-ink-muted">{label}</dt>
                  <dd className="font-display text-xl font-semibold text-ink [font-variant-numeric:tabular-nums]">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>

      <div className="grid content-start gap-4">
        <CaptureFrame label={c.frame} hint={c.frameHint} status={status} recording={phase === "recording"} {...ring}>
          {(phase === "live" || phase === "recording") && <video ref={live} className="absolute inset-0 size-full object-cover" autoPlay muted playsInline />}
          {clip && phase !== "live" && phase !== "recording" && (
            <video src={clip.url} className="absolute inset-0 size-full object-contain" controls={!busy} playsInline muted preload="metadata">
              {t.analysisDetail.videoUnsupported}
            </video>
          )}
        </CaptureFrame>

        {autoStopped && phase === "ready" && <Notice tone="warning">{format(c.autoStopped, { seconds: maxSeconds })}</Notice>}
        {error && <Notice tone="warning">{error}</Notice>}
        {busy && (
          <progress className="visually-hidden" value={fraction} max={1} aria-label={c.uploadingLabel}>
            {format(c.progress, { percent: f.percent(fraction) })}
          </progress>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          {phase === "idle" && <Button glyph="capture" onClick={openCamera} className="min-w-40">{c.openCamera}</Button>}
          {phase === "live" && <Button glyph="capture" onClick={record} className="min-w-40">{c.record}</Button>}
          {phase === "recording" && (
            <Button ref={stopRef} variant="secondary" glyph="pause" onClick={() => recorder.current?.stop()} className="min-w-40">{`${c.stop} · ${f.secondsFromMs(elapsedMs)}`}</Button>
          )}
          {phase === "ready" && (
            <>
              <Button glyph="upload" onClick={send} disabled={!meta || meta.durationMs > limitMs}>{c.submit}</Button>
              <Button variant="secondary" glyph="capture" onClick={openCamera}>{c.again}</Button>
            </>
          )}
          {busy && <Button variant="secondary" glyph="close" pending={phase === "confirming"} onClick={() => upload.current?.abort()}>{c.cancel}</Button>}
        </div>

        {!busy && phase !== "recording" && (
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-ink-muted">
            <span>{c.or}</span>
            <label className={buttonClasses("quiet", false, "cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-accent")}>
              <input
                type="file"
                accept="video/*"
                className="visually-hidden"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  if (file) void accept(file, file.type, undefined);
                  event.currentTarget.value = "";
                }}
              />
              {c.chooseFile}
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
