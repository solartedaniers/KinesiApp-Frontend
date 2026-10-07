"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useT } from "@/lib/i18n/client";

// Sin rojo en la acción destructiva (el rojo es del riesgo): botón en tinta, confirmado en un diálogo
const styles = {
  trigger: "px-3",
  dialog:
    "m-auto w-[min(26rem,calc(100vw-2rem))] rounded-panel border border-line bg-panel p-0 text-ink shadow-overlay backdrop:bg-backdrop",
  body: "grid gap-3 p-6",
  title: "text-xl font-semibold",
  actions: "mt-3 flex flex-wrap justify-end gap-2",
  danger: "bg-ink! text-panel! hover:bg-ink-muted!",
};

/**
 * Confirmación antes de una acción destructiva. <dialog> nativo: foco atrapado, Escape y fondo
 * inerte sin librerías. `action` es una Server Action ya ligada a su recurso.
 */
export function ConfirmDialog({
  triggerLabel,
  triggerIcon = "trash",
  title,
  body,
  confirmLabel,
  action,
}: {
  triggerLabel: string;
  triggerIcon?: IconName;
  title: string;
  body: string;
  confirmLabel: string;
  action: () => Promise<void>;
}) {
  const t = useT();
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button type="button" variant="ghost" className={styles.trigger} onClick={() => dialogRef.current?.showModal()}>
        <Icon name={triggerIcon} size={18} />
        {triggerLabel}
      </Button>
      <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="confirm-title">
        <form action={action} className={styles.body}>
          <h2 id="confirm-title" className={styles.title}>
            {title}
          </h2>
          <p>{body}</p>
          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={() => dialogRef.current?.close()}>
              {t.common.cancel}
            </Button>
            <ConfirmButton label={confirmLabel} />
          </div>
        </form>
      </dialog>
    </>
  );
}

function ConfirmButton({ label }: { label: string }) {
  const t = useT();
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className={styles.danger} pending={pending} pendingLabel={t.common.working}>
      {label}
    </Button>
  );
}
