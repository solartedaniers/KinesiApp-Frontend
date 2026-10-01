import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { VerifyEmailForm, VerifyEmailFromQuery } from "@/components/auth/VerifyEmailForm";
import { t } from "@/lib/i18n";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: t.verifyEmail.metaTitle };

// Isla CSR en un shell estático (§3): el correo llega por `?email=` y se lee en el cliente.
// El fallback es el mismo formulario sin correo precargado, así el HTML estático ya es usable
export default function VerifyEmailPage() {
  return (
    <AuthShell
      eyebrow={t.verifyEmail.eyebrow}
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
