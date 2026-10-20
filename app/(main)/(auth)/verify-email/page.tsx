import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { VerifyEmailForm, VerifyEmailFromQuery } from "@/components/auth/VerifyEmailForm";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.verifyEmail.metaTitle };
}

// Isla CSR (§3): el correo llega por `?email=` y se lee en el cliente. El fallback es el mismo
// formulario sin correo precargado, así el HTML del servidor ya es usable sin JavaScript
export default async function VerifyEmailPage() {
  const t = await getT();
  return (
    <AuthShell
      title={t.verifyEmail.title}
      subtitle={t.verifyEmail.subtitle}
      footer={<Link href={ROUTES.login}>{t.verifyEmail.backToLogin}</Link>}
    >
      <Suspense fallback={<VerifyEmailForm defaultEmail="" />}>
        <VerifyEmailFromQuery />
      </Suspense>
    </AuthShell>
  );
}
