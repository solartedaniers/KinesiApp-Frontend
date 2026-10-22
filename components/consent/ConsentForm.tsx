"use client";

import { useActionState } from "react";

import { formStyles as styles } from "@/components/app/page-classes";
import { Button } from "@/components/ui/Button";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { FormAlert } from "@/components/ui/FormAlert";
import type { ConsentField } from "@/lib/actions/analyses";
import type { FormState } from "@/lib/form-state";
import { useT } from "@/lib/i18n/client";

type ConsentAction = (previous: FormState<ConsentField>, formData: FormData) => Promise<FormState<ConsentField>>;

export function ConsentForm({ action }: { action: ConsentAction }) {
  const t = useT();
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}
      <CheckboxField name="accept" error={state.fieldErrors?.accept}>
        {t.consent.checkbox}
      </CheckboxField>
      <Button type="submit" block pending={pending} pendingLabel={t.common.working} className={styles.submit}>
        {t.consent.continue}
      </Button>
    </form>
  );
}
