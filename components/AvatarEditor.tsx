"use client";

import { useState, useTransition } from "react";

import { Avatar } from "@/components/app/Avatar";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { Icon } from "@/components/ui/Icon";
import type { AvatarResult } from "@/lib/actions/profile";
import { type AvatarPayload, isImageFile } from "@/lib/avatar";
import { AvatarTooLargeError, prepareAvatar } from "@/lib/avatar-upload";
import { useT } from "@/lib/i18n/client";

import styles from "./AvatarEditor.module.css";

/**
 * Foto de perfil: elegir (o tomar con la cámara) → comprimir en un Web Worker → subir por Server
 * Action. La usan la cuenta propia y los deportistas gestionados, cada uno con sus acciones.
 */
export function AvatarEditor({
  name,
  imageUrl,
  upload,
  remove,
}: {
  name: string;
  imageUrl: string | null;
  upload: (payload: AvatarPayload) => Promise<AvatarResult>;
  remove: () => Promise<AvatarResult>;
}) {
  const t = useT();
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
      try {
        return upload(await prepareAvatar(file));
      } catch (failure) {
        return { error: failure instanceof AvatarTooLargeError ? t.avatar.tooLarge : t.avatar.unreadable };
      }
    });
  }

  return (
    <div className={styles.editor}>
      <Avatar name={name} imageUrl={imageUrl} size="lg" />
      <div className={styles.controls}>
        {error && <FormAlert tone="error">{error}</FormAlert>}
        <div className={styles.buttons}>
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
            <Icon name="camera" size={18} />
            {pending ? t.common.working : imageUrl ? t.avatar.change : t.avatar.add}
          </label>
          {imageUrl && (
            <Button type="button" variant="ghost" disabled={pending} onClick={() => run(remove)}>
              {t.avatar.remove}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
