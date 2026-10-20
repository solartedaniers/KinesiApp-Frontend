// Registro de íconos de KinesiApp: trazos de 1.5 en una cuadrícula de 24 y keypoints como puntos,
// el mismo lenguaje que los esqueletos. Cada ícono es un trazo (`d`) más sus articulaciones (`dots`).
// Los dibujé para este dominio: protractor, rodilla, centro de gravedad, cronofotografía.

export type IconDefinition = { d: string; dots?: readonly (readonly [number, number])[] };

export const GLYPHS = {
  // Navegación
  overview: { d: "M3.5 18h17 M4.5 18a7.5 7.5 0 0 1 15 0 M12 18l4-5.5", dots: [[12, 18], [16, 12.5]] },
  capture: { d: "M3 7h12v10H3z M15 10.5l6-3v9l-6-3", dots: [[9, 12]] },
  history: { d: "M9 6h11 M9 12h11 M9 18h11", dots: [[4.5, 6], [4.5, 12], [4.5, 18]] },
  trend: { d: "M3.5 20h17 M5.5 16l5-4 3.5 2 5-6", dots: [[5.5, 16], [10.5, 12], [14, 14], [19, 8]] },
  athlete: { d: "M12 6.4a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8Z M12 7.5v7 M12 14.5l-3.5 6 M12 14.5l3.5 6 M12 9.5l-4 3 M12 9.5l4 3", dots: [[12, 14.5], [12, 9.5]] },
  team: { d: "M8 6.9a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8Z M16 6.9a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8Z M8 8v6 M8 14l-3 6 M8 14l3 6 M16 8v6 M16 14l-3 6 M16 14l3 6", dots: [[8, 14], [16, 14]] },
  roles: { d: "M12 4l7 3v5c0 4.2-3 7.2-7 8.5-4-1.3-7-4.3-7-8.5V7z M9 12l2.2 2.2L15.5 10", dots: [] },
  chat: { d: "M4 5h16v11h-9l-4.5 3.5V16H4z", dots: [[8.5, 10.5], [12, 10.5], [15.5, 10.5]] },
  report: { d: "M6 3h8.5L19 7.5V21H6z M14.5 3v4.5H19 M9 16.5l2.2-3 2.3 1.8 2.5-4", dots: [[9, 16.5], [16, 11.3]] },
  profile: { d: "M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M4.5 20.5a7.5 7.5 0 0 1 15 0", dots: [] },
  // Dominio
  jump: { d: "M12 7.9a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z M12 9v4.5 M12 13.5l-3-1.5-1.5 4 M12 13.5l3-1.5 1.5 4 M12 10l-3.5-4 M12 10l3.5-4 M3 21h18", dots: [[12, 13.5], [7.5, 16], [16.5, 16]] },
  squat: { d: "M10.6 5.7a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z M10 6.5L8 12.5 M8 12.5h6 M14 12.5l-2 6 M10 7.5l7 1 M4 19.5h16", dots: [[8, 12.5], [14, 12.5], [12, 18.5]] },
  angle: { d: "M5 4.5l7 8.5-5 8 M15.5 9.5a5 5 0 0 1 .8 6.8", dots: [[5, 4.5], [12, 13], [7, 21]] },
  centerOfMass: { d: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M12 4v16 M4 12h16 M12 4a8 8 0 0 1 8 8h-8z M12 20a8 8 0 0 1-8-8h8z", dots: [] },
  compare: { d: "M3.5 20h17 M4 15c3-7 5-7 8-2s5 5 8-3 M4 11c3 6 6 6 8 1.5", dots: [[4, 15], [20, 10]] },
  ai: { d: "M6 17l6-10 6 10z M12 7v6.5 M6 17l6-3.5 6 3.5", dots: [[6, 17], [12, 7], [18, 17], [12, 13.5]] },
  repetitions: { d: "M3.5 12c2-6 4-6 6 0s4 6 6 0 3.5-5 5-2.5", dots: [[6.5, 7.5], [12.5, 16.5]] },
  // Interfaz
  upload: { d: "M12 15.5V5 M7.5 9.5L12 5l4.5 4.5 M4 15v4.5h16V15", dots: [[12, 5]] },
  download: { d: "M12 4v10.5 M7.5 10L12 14.5 16.5 10 M4 15v4.5h16V15", dots: [[12, 14.5]] },
  play: { d: "M7 4.5v15l12-7.5z", dots: [] },
  pause: { d: "M8 5v14 M16 5v14", dots: [] },
  check: { d: "M4.5 12.5l4.5 4.5 10.5-10.5", dots: [[9, 17]] },
  alert: { d: "M12 3.5l9.5 16.5h-19z M12 9.5v4.5", dots: [[12, 17]] },
  info: { d: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 11v5.5", dots: [[12, 7.75]] },
  close: { d: "M6 6l12 12 M18 6L6 18", dots: [] },
  menu: { d: "M4 7h16 M4 12h16 M4 17h10", dots: [] },
  plus: { d: "M12 5v14 M5 12h14", dots: [] },
  edit: { d: "M4 20h4.5L19 9.5 14.5 5 4 15.5z M12.5 7l4.5 4.5", dots: [] },
  trash: { d: "M4 6.5h16 M9 6.5V4h6v2.5 M6 6.5l1 14h10l1-14", dots: [] },
  chevronRight: { d: "M9.5 5.5L16 12l-6.5 6.5", dots: [] },
  chevronLeft: { d: "M14.5 5.5L8 12l6.5 6.5", dots: [] },
  eye: { d: "M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z", dots: [[12, 12]] },
  eyeOff: { d: "M2.5 12s3.5-6.5 9.5-6.5c1.6 0 3 .4 4.2 1 M21.5 12s-3.5 6.5-9.5 6.5c-1.6 0-3-.4-4.2-1 M4 20L20 4", dots: [] },
  lock: { d: "M5 11h14v9.5H5z M8 11V7.5a4 4 0 0 1 8 0V11", dots: [[12, 15.75]] },
  mail: { d: "M3.5 5.5h17v13h-17z M3.5 6l8.5 7 8.5-7", dots: [] },
  clock: { d: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 7v5l3.5 2", dots: [[12, 12]] },
  logout: { d: "M14.5 4H19v16h-4.5 M10 16.5L5.5 12 10 7.5 M5.5 12H15", dots: [] },
  sun: { d: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M12 2.5v2 M12 19.5v2 M2.5 12h2 M19.5 12h2 M5.3 5.3l1.4 1.4 M17.3 17.3l1.4 1.4 M5.3 18.7l1.4-1.4 M17.3 6.7l1.4-1.4", dots: [] },
  moon: { d: "M20.5 13.5A8.5 8.5 0 1 1 10.5 3.5a6.5 6.5 0 0 0 10 10Z", dots: [] },
  system: { d: "M3.5 4.5h17v11h-17z M8.5 20h7 M12 15.5V20", dots: [] },
  globe: { d: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M3 12h18 M12 3a14 14 0 0 1 0 18 M12 3a14 14 0 0 0 0 18", dots: [] },
} as const satisfies Record<string, IconDefinition>;

export type GlyphName = keyof typeof GLYPHS;
