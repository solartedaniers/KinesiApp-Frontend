import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { t } from "@/lib/i18n";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: t.register.metaTitle };

export default function RegisterPage() {
  return (
    <AuthShell
      title={t.register.title}
      subtitle={t.register.subtitle}
      footer={
        <>
          {t.register.hasAccount} <Link href={ROUTES.login}>{t.register.signIn}</Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
