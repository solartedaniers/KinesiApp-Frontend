import "./instrument.css";

import { RevealRoot } from "@/components/instrument/RevealRoot";
import { INSTRUMENT_FONT_VARIABLES } from "@/lib/design/fonts";

// Todo lo de aquí adentro ya usa la identidad del instrumento; el resto de la app sigue igual
export default function StyleGuideLayout({ children }: LayoutProps<"/style-guide">) {
  return (
    <div data-design="instrument" className={`${INSTRUMENT_FONT_VARIABLES} kin-ambient min-h-dvh`}>
      {children}
      <RevealRoot />
    </div>
  );
}
