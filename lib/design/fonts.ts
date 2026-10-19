import { Albert_Sans, Anybody, Figtree, Golos_Text, Saira, Unbounded } from "next/font/google";

import type { DirectionId } from "./directions";

// next/font descarga las fuentes en el build y las sirve desde el propio dominio: ninguna petición
// a terceros en tiempo de ejecución. Las cifras salen de la display con números tabulares, no de una mono.
// Estela: Anybody, cuyo eje de ancho estira los números como una foto movida; Albert Sans para leer.
const trailDisplay = Anybody({ subsets: ["latin"], axes: ["wdth"], style: ["normal", "italic"], variable: "--font-trail-display", display: "swap" });
const trailSans = Albert_Sans({ subsets: ["latin"], variable: "--font-trail-sans", display: "swap" });
// Ritmo: Unbounded, redonda y ancha como la gráfica de una camiseta deportiva; Figtree para leer.
const rhythmDisplay = Unbounded({ subsets: ["latin"], variable: "--font-rhythm-display", display: "swap" });
const rhythmSans = Figtree({ subsets: ["latin"], variable: "--font-rhythm-sans", display: "swap" });
// Instrumento: Saira semicondensada, de esfera de reloj deportivo; Golos Text, de pantalla técnica.
const instrumentDisplay = Saira({ subsets: ["latin"], axes: ["wdth"], variable: "--font-instrument-display", display: "swap" });
const instrumentSans = Golos_Text({ subsets: ["latin"], variable: "--font-instrument-sans", display: "swap" });

export const DIRECTION_FONT_VARIABLES: Record<DirectionId, string> = {
  a: `${trailDisplay.variable} ${trailSans.variable}`,
  b: `${rhythmDisplay.variable} ${rhythmSans.variable}`,
  c: `${instrumentDisplay.variable} ${instrumentSans.variable}`,
};
