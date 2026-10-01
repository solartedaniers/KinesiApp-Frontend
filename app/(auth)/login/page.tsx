import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { t } from "@/lib/i18n";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: t.login.metaTitle };

// SSG: el HTML es igual para todos; `?next=` lo resuelve la Server Action (lib/actions/auth.ts)
export default function LoginPage() {
  return (
    <AuthShell
      title={t.login.title}
      subtitle={t.login.subtitle}
      footer={
        <>
          {t.login.noAccount} <Link href={ROUTES.register}>{t.login.register}</Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
