import Link from "next/link";

import { ThemeSwitch } from "./ThemeSwitch";

import { DICTIONARIES, type Locale } from "@/lib/i18n";
import { ROUTES } from "@/lib/routes";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = DICTIONARIES[locale];
  return (
    <footer className="border-t border-line bg-panel">
      <div className="mx-auto grid max-w-content justify-items-center gap-5 px-4 py-8 text-center sm:px-6">
        {/* El aviso en tinta y no en el gris secundario: es lo que más importa que se lea del pie */}
        <p className="w-full text-base font-bold text-balance text-ink sm:max-w-3xl sm:text-lg">{t.app.disclaimer}</p>
        <nav aria-label={t.site.nav}>
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-muted">
            <li><Link href={ROUTES.login}>{t.site.signIn}</Link></li>
            <li className="sm:hidden"><ThemeSwitch /></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
