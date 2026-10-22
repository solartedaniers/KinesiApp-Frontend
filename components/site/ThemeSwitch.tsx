"use client";

import { useSyncExternalStore } from "react";

import { Glyph } from "@/components/instrument/Glyph";
import { PREFERENCE_COOKIE } from "@/lib/config";
import type { GlyphName } from "@/lib/design/icons";
import { useT } from "@/lib/i18n/client";
import { readPreference, writePreference } from "@/lib/preference-cookie";
import { DEFAULT_THEME, resolveTheme, type Theme, themeAttribute, THEMES } from "@/lib/theme";

const GLYPHS: Record<Theme, GlyphName> = { system: "system", light: "sun", dark: "moon" };

const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const currentTheme = () => resolveTheme(readPreference(PREFERENCE_COOKIE.theme));

function chooseTheme(theme: Theme) {
  writePreference(PREFERENCE_COOKIE.theme, theme);
  const attribute = themeAttribute(theme);
  if (attribute) document.documentElement.setAttribute("data-theme", attribute);
  else document.documentElement.removeAttribute("data-theme");
  for (const listener of listeners) listener();
}

/**
 * Tema en el navegador: escribo la cookie y cambio data-theme al instante, sin ir al servidor. La misma
 * cookie la lee después el layout de la app. `initial` es el tema que ya conoce el servidor; en las
 * páginas estáticas no hay servidor que lo lea y queda el del sistema hasta hidratar.
 */
export function ThemeSwitch({ className = "", initial = DEFAULT_THEME }: { className?: string; initial?: Theme }) {
  const t = useT().preferences;
  const theme = useSyncExternalStore(subscribe, currentTheme, () => initial);
  return (
    <fieldset className={className}>
      <legend className="visually-hidden">{t.theme}</legend>
      <div className="kin-well flex items-center gap-0.5 rounded-full p-0.5">
        {THEMES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => chooseTheme(option)}
            aria-pressed={option === theme}
            aria-label={t.themeNames[option]}
            title={t.themeNames[option]}
            className="grid size-8 place-items-center rounded-full text-ink-muted transition-colors hover:text-ink pointer-coarse:size-11 aria-pressed:bg-panel aria-pressed:text-accent aria-pressed:shadow-[0_1px_2px_var(--kin-shade)]"
          >
            <Glyph name={GLYPHS[option]} size={16} />
          </button>
        ))}
      </div>
    </fieldset>
  );
}
