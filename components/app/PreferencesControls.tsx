import { Icon, type IconName } from "@/components/ui/Icon";
import { setLocale, setTheme } from "@/lib/actions/preferences";
import { LOCALES } from "@/lib/i18n";
import { getLocale, getT } from "@/lib/i18n/server";
import { getTheme } from "@/lib/preferences";
import { type Theme, THEMES } from "@/lib/theme";

import styles from "./PreferencesControls.module.css";

const THEME_ICONS: Record<Theme, IconName> = { system: "monitor", light: "sun", dark: "moon" };

/**
 * Preferencias de la interfaz como botones de formulario con su Server Action: funcionan sin JS y la
 * página vuelve renderizada en el servidor ya con la preferencia aplicada.
 */
export async function PreferencesControls() {
  const [t, locale, theme] = await Promise.all([getT(), getLocale(), getTheme()]);
  return (
    <div className={styles.controls}>
      <fieldset className={styles.group}>
        <legend className={styles.visuallyHidden}>{t.preferences.language}</legend>
        <div className={styles.options}>
          <span className={styles.globe} aria-hidden="true"><Icon name="globe" size={16} /></span>
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
