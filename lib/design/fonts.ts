import { Golos_Text, Saira } from "next/font/google";

// next/font descarga las fuentes en el build y las sirve desde el propio dominio: ninguna petición
// a terceros en tiempo de ejecución. Saira semicondensada para cifras y títulos, como la esfera de un
// reloj deportivo; Golos Text, de pantalla técnica, para leer. Las cifras usan números tabulares.
const display = Saira({ subsets: ["latin"], axes: ["wdth"], variable: "--font-instrument-display", display: "swap" });
const sans = Golos_Text({ subsets: ["latin"], variable: "--font-instrument-sans", display: "swap" });

export const INSTRUMENT_FONT_VARIABLES = `${display.variable} ${sans.variable}`;
