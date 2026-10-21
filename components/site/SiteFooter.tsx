import { ThemeSwitch } from "./ThemeSwitch";

import { DICTIONARIES, type Locale } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = DICTIONARIES[locale];
  return (
    <footer className="border-t border-line bg-panel">
      <div className="mx-auto grid max-w-content justify-items-center gap-5 px-4 py-8 text-center sm:px-6">
        {/* El aviso en tinta y no en el gris secundario: es lo que más importa que se lea del pie */}
        <p className="w-full text-base font-bold text-balance text-ink sm:max-w-3xl sm:text-lg">{t.app.disclaimer}</p>
        {/* En el celular el selector de tema no cabe en la cabecera */}
        <ThemeSwitch className="sm:hidden" />
      </div>
    </footer>
  );
}
