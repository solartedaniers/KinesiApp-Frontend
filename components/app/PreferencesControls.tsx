import { ThemeSwitch } from "@/components/site/ThemeSwitch";
import { getLocale } from "@/lib/i18n/server";
import { getTheme } from "@/lib/preferences";

import { LocaleButtons } from "./LocaleButtons";

// Dos grupos chicos (idioma y tema): en la barra lateral apilados abajo; en la barra superior, en fila
const styles = {
  controls: "flex flex-wrap gap-2 border-t border-line px-1 pt-4",
  compact: "flex gap-1.5",
  option: "grid h-8 min-w-8 pointer-coarse:h-11 pointer-coarse:min-w-11 place-items-center rounded-full px-2 text-xs font-semibold text-ink-muted hover:text-ink aria-pressed:bg-panel aria-pressed:text-accent aria-pressed:shadow-[0_1px_2px_var(--kin-shade)]",
};

/** Preferencias de la interfaz: el servidor les pasa el idioma y el tema de la cookie para que el HTML ya llegue marcado. */
export async function PreferencesControls({ compact = false }: { compact?: boolean }) {
  const [locale, theme] = await Promise.all([getLocale(), getTheme()]);
  return (
    <div className={compact ? styles.compact : styles.controls}>
      <LocaleButtons current={locale} optionClassName={styles.option} />
      <ThemeSwitch initial={theme} className="min-w-0" />
    </div>
  );
}
