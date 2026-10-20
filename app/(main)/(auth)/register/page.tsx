import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.register.metaTitle };
}

export default async function RegisterPage() {
  const t = await getT();
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
