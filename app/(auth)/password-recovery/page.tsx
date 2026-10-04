import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordRecoveryFlow } from "@/components/auth/PasswordRecoveryFlow";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.recovery.metaTitle };
}

// CSR: los 3 pasos viven en el estado del cliente; el código nunca queda en la URL (§3)
export default async function PasswordRecoveryPage() {
  const t = await getT();
  return (
    <AuthShell
      title={t.recovery.title}
      footer={<Link href={ROUTES.login}>{t.recovery.backToLogin}</Link>}
    >
      <PasswordRecoveryFlow />
    </AuthShell>
  );
}
