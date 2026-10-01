"use client";

import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { t } from "@/lib/i18n";

import styles from "@/components/app/Page.module.css";

// Backend caído u otro fallo inesperado: se ofrece reintentar sin cerrar la sesión (lib/session.ts)
export default function AppError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className={`${styles.page} ${styles.narrow} ${styles.errorPage}`}>
      <FormAlert tone="error">
        <strong>{t.appError.title}</strong>
        <p>{t.appError.body}</p>
      </FormAlert>
      <Button onClick={() => retry()}>{t.appError.retry}</Button>
    </main>
  );
}
