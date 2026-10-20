import Link from "next/link";

import { LocaleSwitch } from "./LocaleSwitch";
import { ThemeSwitch } from "./ThemeSwitch";

import { ButtonLink } from "@/components/instrument/Button";
import { Glyph } from "@/components/instrument/Glyph";
import { Wordmark } from "@/components/instrument/Wordmark";
import { DICTIONARIES, type Locale } from "@/lib/i18n";
import { guidePath, localizedPath, ROUTES } from "@/lib/routes";
import { MOVEMENT_TYPES } from "@/lib/types";

/** Cabecera del sitio público: marca, guías, idioma, tema y acceso. `path` es la página actual sin idioma. */
export function SiteHeader({ locale, path }: { locale: Locale; path: string }) {
  const t = DICTIONARIES[locale];
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-panel shadow-[0_10px_30px_-24px_var(--kin-shade)]">
      <div className="mx-auto flex h-16 max-w-content items-center gap-3 px-4 sm:px-6">
        <Link href={localizedPath(locale, ROUTES.landing)} aria-label={t.site.home} className="inline-flex min-h-11 min-w-11 items-center rounded-panel no-underline hover:no-underline">
          <Wordmark name={t.app.name} />
        </Link>
        <nav aria-label={t.site.guides} className="ml-2 max-lg:hidden">
          <ul className="flex gap-1">
            {MOVEMENT_TYPES.map((movement) => (
              <li key={movement}>
                <Link
                  href={guidePath(movement, locale)}
                  aria-current={path === guidePath(movement) ? "page" : undefined}
                  className="inline-flex min-h-11 items-center gap-2 rounded-panel px-3 text-sm font-semibold text-ink-muted no-underline hover:bg-accent-soft hover:text-accent hover:no-underline aria-[current=page]:bg-accent-soft aria-[current=page]:text-accent"
                >
                  <Glyph name={movement} size={18} />
                  {t.guide.movements[movement].title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LocaleSwitch path={path} />
          <ThemeSwitch className="max-sm:hidden" />
          <ButtonLink href={ROUTES.login} variant="quiet" className="max-md:hidden">{t.site.signIn}</ButtonLink>
          <ButtonLink href={ROUTES.register} className="max-sm:px-3">{t.site.createAccount}</ButtonLink>
        </div>
      </div>
    </header>
  );
}
