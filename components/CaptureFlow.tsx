"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { formStyles } from "@/components/app/page-classes";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { requestUploadToken } from "@/lib/actions/analyses";
import { API_PATHS } from "@/lib/api-paths";
import { publicApiBaseUrl } from "@/lib/config";
import { codeMessage } from "@/lib/errors";
import { format } from "@/lib/i18n";
import { useT } from "@/lib/i18n/client";
import { analysisPath } from "@/lib/routes";
import { MOVEMENT_TYPES, type MovementType } from "@/lib/types";
import {
  bytesToMegabytes,
  startVideoUpload,
  UPLOAD_ABORTED_CODE,
  validateVideoFile,
  type VideoFileError,
  type VideoUpload,
} from "@/lib/video-upload";

import styles from "./CaptureFlow.module.css";
import { UploadProgress } from "./UploadProgress";

type Phase = { kind: "idle" } | { kind: "uploading"; fraction: number } | { kind: "done" };

/**
 * Elegir movimiento y video → revisar → subir con progreso → al detalle, que hace polling. El input
 * con `capture` abre la cámara nativa en el celular (graba mejor que MediaRecorder y funciona dentro
 * de WebViews); en el computador abre el selector de archivos.
 */
export function CaptureFlow({ athleteId, maxBytes }: { athleteId: number; maxBytes: number }) {
  const t = useT();
  const movementOptions = MOVEMENT_TYPES.map((movement) => ({ value: movement, label: t.analysis.movement[movement] }));
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const uploadRef = useRef<VideoUpload | null>(null);

  // La URL del blob retiene el archivo en memoria: se libera al cambiarlo o al salir
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  // Salir de la página no deja una subida huérfana en segundo plano
  useEffect(() => () => uploadRef.current?.abort(), []);

  const fileErrorMessage = (fileError: VideoFileError) => format(t.capture.errors[fileError], { max: bytesToMegabytes(maxBytes) });

  function chooseFile(selected: File | null) {
    const fileError = validateVideoFile(selected, maxBytes);
    setError(fileError && selected ? fileErrorMessage(fileError) : null);
    setFile(fileError ? null : selected);
    setPreviewUrl(fileError || !selected ? null : URL.createObjectURL(selected));
  }

  async function submit(formData: FormData) {
    const fileError = validateVideoFile(file, maxBytes);
    if (fileError || !file) {
      setError(fileErrorMessage(fileError ?? "videoRequired"));
      return;
    }
    setError(null);
    setPhase({ kind: "uploading", fraction: 0 });

    const tokenResult = await requestUploadToken(athleteId);
    if ("error" in tokenResult) {
      setPhase({ kind: "idle" });
      setError(tokenResult.error);
      return;
    }
    const movement = formData.get("movement_type");
    const upload = startVideoUpload({
      url: `${publicApiBaseUrl()}${API_PATHS.uploadAnalysis}`,
      token: tokenResult.token,
      athleteId,
      movementType: MOVEMENT_TYPES.includes(movement as MovementType) ? (movement as MovementType) : MOVEMENT_TYPES[0],
      file,
      onProgress: (fraction) => setPhase({ kind: "uploading", fraction }),
    });
    uploadRef.current = upload;
    const outcome = await upload.done;
    uploadRef.current = null;

    if (outcome.ok) {
      setPhase({ kind: "done" });
      router.push(analysisPath(outcome.analysisId));
      return;
    }
    setPhase({ kind: "idle" });
    if (outcome.code !== UPLOAD_ABORTED_CODE) setError(codeMessage(t, outcome.code));
  }

  const busy = phase.kind !== "idle";

  return (
    <div className={styles.flow}>
      <section className={styles.guide} aria-labelledby="capture-guide">
        <h2 id="capture-guide" className={styles.guideTitle}>
          {t.capture.guide.title}
        </h2>
        <ul className={styles.guideList}>
          {t.capture.guide.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <form action={submit} className={formStyles.form} noValidate>
        {error && <FormAlert tone="error">{error}</FormAlert>}
        <SegmentedControl name="movement_type" legend={t.capture.movement} options={movementOptions} defaultValue={MOVEMENT_TYPES[0]} />

        <label className={styles.picker}>
          <input
            type="file"
            name="video"
            accept="video/*"
            capture="environment"
            className="visually-hidden"
            disabled={busy}
            onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
          />
          <span className={styles.pickerLabel}>{file ? t.capture.changeVideo : t.capture.chooseVideo}</span>
          <span className={styles.pickerHint}>{file ? file.name : format(t.capture.limitHint, { max: bytesToMegabytes(maxBytes) })}</span>
        </label>

        {previewUrl && (
          <video className={styles.preview} src={previewUrl} controls playsInline muted preload="metadata">
            {t.analysisDetail.videoUnsupported}
          </video>
        )}

        {phase.kind === "uploading" && <UploadProgress fraction={phase.fraction} />}

        <div className={styles.actions}>
          <Button type="submit" pending={busy} pendingLabel={t.capture.uploading} disabled={!file}>
            {t.capture.submit}
          </Button>
          {phase.kind === "uploading" && (
            <Button type="button" variant="secondary" onClick={() => uploadRef.current?.abort()}>
              {t.capture.cancel}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
