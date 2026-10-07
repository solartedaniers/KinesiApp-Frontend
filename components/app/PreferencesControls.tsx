import { Icon, type IconName } from "@/components/ui/Icon";
import { setLocale, setTheme } from "@/lib/actions/preferences";
import { LOCALES } from "@/lib/i18n";
import { getLocale, getT } from "@/lib/i18n/server";
import { getTheme } from "@/lib/preferences";
import { type Theme, THEMES } from "@/lib/theme";

// Dos grupos chicos (idioma y tema): en la barra lateral apilados abajo; en la barra superior, en fila
const styles = {
  controls: "flex flex-wrap gap-2 border-t border-line px-1 pt-4",
  compact: "flex gap-1.5",
  group: "min-w-0",
  visuallyHidden: "visually-hidden",
  options: "flex items-center gap-0.5 rounded-control border border-line bg-sunken p-0.5",
  option: "grid h-8 min-w-8 place-items-center rounded-[0.25rem] px-1.5 text-xs font-semibold text-ink-muted hover:text-ink aria-pressed:bg-panel aria-pressed:text-accent aria-pressed:ring-1 aria-pressed:ring-line",
};

const THEME_ICONS: Record<Theme, IconName> = { system: "monitor", light: "sun", dark: "moon" };

/**
 * Preferencias de la interfaz como botones de formulario con su Server Action: funcionan sin JS y la
 * página vuelve renderizada en el servidor ya con la preferencia aplicada.
 */
export async function PreferencesControls({ compact = false }: { compact?: boolean }) {
  const [t, locale, theme] = await Promise.all([getT(), getLocale(), getTheme()]);
  return (
    <div className={compact ? styles.compact : styles.controls}>
      <fieldset className={styles.group}>
        <legend className={styles.visuallyHidden}>{t.preferences.language}</legend>
        <div className={styles.options}>
          {LOCALES.map((option) => (
            <form key={option} action={setLocale.bind(null, option)}>
              <button
                type="submit"
                className={styles.option}
                aria-pressed={option === locale}
                aria-label={t.preferences.languageNames[option]}
                title={t.preferences.languageNames[option]}
                lang={option}
              >
                {option.toUpperCase()}
              </button>
            </form>
          ))}
        </div>
      </fieldset>
      <fieldset className={styles.group}>
        <legend className={styles.visuallyHidden}>{t.preferences.theme}</legend>
        <div className={styles.options}>
          {THEMES.map((option) => (
            <form key={option} action={setTheme.bind(null, option)}>
              <button
                type="submit"
                className={styles.option}
                aria-pressed={option === theme}
                aria-label={t.preferences.themeNames[option]}
                title={t.preferences.themeNames[option]}
              >
                <Icon name={THEME_ICONS[option]} size={16} />
              </button>
            </form>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
