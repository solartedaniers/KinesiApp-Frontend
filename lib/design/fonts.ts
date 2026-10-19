import { Instrument_Sans, Martian_Mono, Newsreader } from "next/font/google";

// next/font descarga las fuentes en el build y las sirve desde el propio dominio: ninguna petición
// a terceros en tiempo de ejecución.
// Newsreader: la serif de las láminas científicas de Marey, para títulos y pies de figura.
// Instrument Sans: interfaz legible, con eje de ancho para etiquetas condensadas.
// Martian Mono: métricas; sus cifras tabulares sostienen los números grandes.
const display = Newsreader({ subsets: ["latin"], axes: ["opsz"], style: ["normal", "italic"], variable: "--font-lab-display", display: "swap" });
const sans = Instrument_Sans({ subsets: ["latin"], axes: ["wdth"], variable: "--font-lab-sans", display: "swap" });
const mono = Martian_Mono({ subsets: ["latin"], axes: ["wdth"], variable: "--font-lab-mono", display: "swap" });

export const LAB_FONT_VARIABLES = `${display.variable} ${sans.variable} ${mono.variable}`;
