import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.login.metaTitle };
}

// SSR por idioma (cookie): sin datos del usuario; `?next=` lo resuelve la Server Action (lib/actions/auth.ts)
export default async function LoginPage() {
  const t = await getT();
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
