"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import type { InlineResult } from "@/lib/actions/admin";
import { useT } from "@/lib/i18n/client";

import styles from "./InlineControls.module.css";

/** Un botón con su Server Action ligada dentro de una fila de tabla, con el error al lado. */
export function InlineActionButton({ label, action }: { label: string; action: () => Promise<InlineResult> }) {
  const t = useT();
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className={styles.form}>
      <Button type="submit" variant="ghost" pending={pending} pendingLabel={t.common.working} className={styles.button}>
        {label}
      </Button>
      {state.error && (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
