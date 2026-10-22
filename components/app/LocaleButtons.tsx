"use client";

import { useOptimistic, useTransition } from "react";

import { setLocale } from "@/lib/actions/preferences";
import { type Locale, LOCALES } from "@/lib/i18n";
import { useT } from "@/lib/i18n/client";

/**
 * Idioma dentro de la app. La Server Action vuelve a renderizar la página, así que la corro en una
 * transición: la interfaz sigue respondiendo, marco el idioma elegido al instante y lo dejo parpadeando
 * hasta que llegan los textos. Mientras tanto ignoro otros clics para no encolar renders completos.
 */
export function LocaleButtons({ current, optionClassName }: { current: Locale; optionClassName: string }) {
  const t = useT().preferences;
  const [pending, startTransition] = useTransition();
  const [shown, show] = useOptimistic(current);

  function choose(locale: Locale) {
    if (pending || locale === current) return;
    startTransition(async () => {
      show(locale);
      await setLocale(locale);
    });
  }

  return (
    <fieldset className="min-w-0" aria-busy={pending}>
      <legend className="visually-hidden">{t.language}</legend>
      <div className="kin-well flex items-center gap-0.5 rounded-full p-0.5">
        {LOCALES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => choose(option)}
            className={`${optionClassName} ${pending && option === shown ? "kin-shimmer" : ""}`}
            aria-pressed={option === shown}
            aria-disabled={pending}
            aria-label={t.languageNames[option]}
            title={t.languageNames[option]}
            lang={option}
          >
            {option.toUpperCase()}
          </button>
        ))}
      </div>
      <span role="status" className="visually-hidden">{pending ? t.changingLanguage : ""}</span>
    </fieldset>
  );
}
