import type { Metadata } from "next";

import { Logo } from "@/components/brand/Logo";
import { PreferencesControls } from "@/components/app/PreferencesControls";
import { ButtonLink } from "@/components/ui/Button";
import { getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.notFound.metaTitle };
}

// Única página 404: también la muestran los recursos ajenos (403 del backend → notFound) sin
// revelar que existen. "Ir al inicio" pasa por /home, que decide según haya sesión o no
export default async function NotFound() {
  const t = await getT();
  return (
    <main className="mx-auto flex min-h-dvh max-w-content flex-col px-4 sm:px-8">
      <div className="flex h-20 items-center justify-between gap-3">
        <Logo href={ROUTES.landing} collapsible />
        <PreferencesControls compact />
      </div>
      <div className="my-auto grid max-w-prose justify-items-start gap-4 py-16">
        <p className="font-display text-score font-semibold text-line-strong tabular-nums">{t.notFound.code}</p>
        <h1 className="text-3xl font-semibold text-ink">{t.notFound.title}</h1>
        <p className="text-ink-muted">{t.notFound.body}</p>
        <ButtonLink href={ROUTES.home} className="mt-2">
          {t.notFound.home}
        </ButtonLink>
      </div>
    </main>
  );
}
