import type { Metadata } from "next";

import { ButtonLink } from "@/components/instrument/Button";
import { Wordmark } from "@/components/instrument/Wordmark";
import { RetryButton } from "@/components/site/RetryButton";
import { DICTIONARIES } from "@/lib/i18n";
import { siteLocale } from "@/lib/i18n/site";
import { guidePath } from "@/lib/routes";
import { MOVEMENT_TYPES } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/[locale]/offline">): Promise<Metadata> {
  const t = DICTIONARIES[await siteLocale(params)];
  return { title: t.offline.metaTitle, robots: { index: false, follow: false } };
}

// Estática para que el Service Worker la guarde al instalarse y la muestre cuando una navegación falla sin red
export default async function OfflinePage({ params }: PageProps<"/[locale]/offline">) {
  const locale = await siteLocale(params);
  const t = DICTIONARIES[locale];
  return (
    <main className="mx-auto flex min-h-dvh max-w-content flex-col px-4 sm:px-6">
      <div className="flex h-16 items-center">
        <Wordmark name={t.app.name} />
      </div>
      <section aria-labelledby="offline-title" className="kin-card my-auto grid max-w-prose justify-items-start gap-4 p-6 sm:p-8">
        <svg viewBox="0 0 64 40" className="h-12 w-auto text-line-strong" aria-hidden>
          <path d="M4 32 L18 32 L24 14 L32 36 L38 24 L44 32 L60 32" className="fill-none stroke-current" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" />
        </svg>
        <h1 id="offline-title" className="font-display text-3xl font-bold tracking-tight text-ink">{t.offline.title}</h1>
        <p className="text-ink-muted">{t.offline.body}</p>
        <RetryButton label={t.offline.retry} />
        <p className="text-sm text-ink-muted">{t.offline.available}</p>
        <ul className="flex flex-wrap gap-2">
          {MOVEMENT_TYPES.map((movement) => (
            <li key={movement}>
              <ButtonLink href={guidePath(movement, locale)} variant="secondary" glyph={movement}>{t.guide.movements[movement].title}</ButtonLink>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
