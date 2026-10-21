import Link from "next/link";

import { ThemeSwitch } from "./ThemeSwitch";

import { DICTIONARIES, type Locale } from "@/lib/i18n";
import { ROUTES } from "@/lib/routes";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = DICTIONARIES[locale];
  return (
    <footer className="border-t border-line bg-panel">
      <div className="mx-auto grid max-w-content gap-6 px-4 py-8 text-sm text-ink-muted sm:px-6 md:grid-cols-[1fr_auto] md:items-start">
        <p className="max-w-prose">{t.app.disclaimer}</p>
        <nav aria-label={t.site.nav}>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <li><Link href={ROUTES.login}>{t.site.signIn}</Link></li>
            <li className="sm:hidden"><ThemeSwitch /></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
