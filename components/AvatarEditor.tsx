"use client";

import { type ReactNode, useState, useTransition } from "react";

import { Avatar } from "@/components/app/Avatar";
import { Button, buttonClasses } from "@/components/instrument/Button";
import { Glyph } from "@/components/instrument/Glyph";
import { FormAlert } from "@/components/ui/FormAlert";
import type { AvatarResult, AvatarUploadStart } from "@/lib/actions/profile";
import { isImageFile } from "@/lib/avatar";
import { AvatarTooLargeError, prepareAvatar } from "@/lib/avatar-upload";
import { codeMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/client";
import { uploadToBucket } from "@/lib/video-upload";

const styles = {
  editor: "flex flex-wrap items-center gap-4",
  stacked: "grid justify-items-center gap-4 text-center",
  controls: "grid min-w-50 flex-1 gap-2",
  buttons: "flex flex-wrap gap-2",
  pick: buttonClasses("secondary", false, "cursor-pointer aria-disabled:cursor-progress aria-disabled:opacity-60"),
};

type EditorLabels = { add: string; change: string; remove: string };

/**
 * Imagen que sube directo al bucket: elegir (o tomar con la cámara) → comprimir en un Web Worker → URL firmada
 * → PUT directo → confirmar. La usan la cuenta propia y los deportistas gestionados con su avatar, y los
 * equipos con su logo (`preview` y `labels` propios).
 */
export function AvatarEditor({
  name,
  imageUrl,
  start,
  confirm,
  remove,
  preview,
  labels,
  stacked = false,
}: {
  name: string;
  imageUrl: string | null;
  start: (type: string, size: number) => Promise<AvatarUploadStart>;
  confirm: (uploadId: string) => Promise<AvatarResult>;
  remove: () => Promise<AvatarResult>;
  preview?: ReactNode;
  labels?: EditorLabels;
  /** Imagen arriba y botones debajo, centrados (encabezado del equipo). */
  stacked?: boolean;
}) {
  const t = useT();
  const text = labels ?? t.avatar;
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(task: () => Promise<AvatarResult>) {
    setError(null);
    startTransition(async () => {
      const result = await task();
      if (result.error) setError(result.error);
    });
  }

  function choose(file: File | null) {
    if (!file) return;
    if (!isImageFile(file)) {
      setError(t.avatar.invalidType);
      return;
    }
    run(async () => {
      let image: Blob;
      try {
        image = await prepareAvatar(file);
      } catch (failure) {
        return { error: failure instanceof AvatarTooLargeError ? t.avatar.tooLarge : t.avatar.unreadable };
      }
      const started = await start(image.type, image.size);
      if ("error" in started) return started;
      const outcome = await uploadToBucket(started.target, image).done;
      return outcome.ok ? confirm(started.target.upload_id) : { error: codeMessage(t, outcome.code) };
    });
  }

  return (
    <div className={stacked ? styles.stacked : styles.editor}>
      {preview ?? <Avatar name={name} imageUrl={imageUrl} size="lg" />}
      <div className={styles.controls}>
        {error && <FormAlert tone="error">{error}</FormAlert>}
        <div className={`${styles.buttons} ${stacked ? "justify-center" : ""}`}>
          <label className={styles.pick} aria-disabled={pending || undefined}>
            <input
              type="file"
              accept="image/*"
              className="visually-hidden"
              disabled={pending}
              onChange={(event) => {
                choose(event.target.files?.[0] ?? null);
                event.target.value = "";
              }}
            />
            <Glyph name="upload" size={18} />
            {pending ? t.common.working : imageUrl ? text.change : text.add}
          </label>
          {imageUrl && (
            <Button type="button" variant="quiet" disabled={pending} onClick={() => run(remove)}>
              {text.remove}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
