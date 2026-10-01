import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordRecoveryFlow } from "@/components/auth/PasswordRecoveryFlow";
import { t } from "@/lib/i18n";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: t.recovery.metaTitle };

// CSR: los 3 pasos viven en el estado del cliente; el código nunca queda en la URL (§3)
export default function PasswordRecoveryPage() {
  return (
    <AuthShell
      title={t.recovery.title}
      footer={<Link href={ROUTES.login}>{t.recovery.backToLogin}</Link>}
    >
      <PasswordRecoveryFlow />
    </AuthShell>
  );
}
