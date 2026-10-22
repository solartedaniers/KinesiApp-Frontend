"use client";

import Link, { useLinkStatus } from "next/link";

import { PREFERENCE_COOKIE } from "@/lib/config";
import { LOCALES } from "@/lib/i18n";
import { useLocale, useT } from "@/lib/i18n/client";
import { writePreference } from "@/lib/preference-cookie";
import { localizedPath } from "@/lib/routes";

/** Brillo sobre el idioma elegido mientras la navegación espera; si la página ya estaba precargada no aparece. */
function PendingHint() {
  const { pending } = useLinkStatus();
  return <span aria-hidden className={`absolute inset-0 rounded-full ${pending ? "kin-shimmer" : "opacity-0"}`} />;
}

/** Enlaces a la misma página en el otro idioma; guardo la elección para que la app la respete al entrar. */
export function LocaleSwitch({ path }: { path: string }) {
  const t = useT().preferences;
  const current = useLocale();
  return (
    <nav aria-label={t.language}>
      <ul className="kin-well flex items-center gap-0.5 rounded-full p-0.5">
        {LOCALES.map((locale) => (
          <li key={locale}>
            <Link
              href={localizedPath(locale, path)}
              hrefLang={locale}
              lang={locale}
              aria-current={locale === current ? "page" : undefined}
              aria-label={t.languageNames[locale]}
              onClick={() => writePreference(PREFERENCE_COOKIE.locale, locale)}
              className="relative grid h-8 min-w-8 place-items-center rounded-full px-2 text-xs font-semibold text-ink-muted no-underline hover:text-ink hover:no-underline pointer-coarse:h-11 pointer-coarse:min-w-11 aria-[current=page]:bg-panel aria-[current=page]:text-accent aria-[current=page]:shadow-[0_1px_2px_var(--kin-shade)]"
            >
              <PendingHint />
              <span className="relative">{locale.toUpperCase()}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
