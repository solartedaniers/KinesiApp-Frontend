// Cinemática directa de un cuerpo en vista lateral, mirando a la derecha. Las ilustraciones del
// laboratorio (esqueletos, cronofotografías, trayectoria del centro de gravedad) salen de ángulos
// articulares y no de coordenadas dibujadas a mano, para que lo que se ve sea biomecánicamente posible.
// Lógica pura (testeada en pose.test.ts). Unidades: la estatura es 100; y crece hacia abajo (SVG).

export type Point = { x: number; y: number };

/** Ángulos en grados. 0 en todos es estar de pie con los brazos colgando. */
export type PoseAngles = {
  /** Inclinación de la pierna hacia delante, desde la vertical (dorsiflexión). */
  shank: number;
  /** Flexión de rodilla: 0 es la pierna extendida. Es el ángulo que mide la IA. */
  knee: number;
  /** Flexión de cadera entre muslo y tronco. */
  hip: number;
  /** Flexión de hombro: positiva lleva el brazo adelante y arriba. */
  shoulder: number;
  elbow: number;
};

export type Joint = "head" | "neck" | "shoulder" | "elbow" | "wrist" | "hip" | "knee" | "ankle" | "heel" | "toe";
export type Keypoints = Record<Joint, Point>;

// Longitudes de segmento en proporción a la estatura (Drillis y Contini, redondeadas)
export const SEGMENTS = { foot: 15, heel: 4, shank: 25, thigh: 24, trunk: 29, neck: 5, head: 6, upperArm: 18, forearm: 16 } as const;

// Fracción de la masa corporal de cada segmento (Dempster); el único miembro dibujado lleva la masa de los dos
const MASS = { head: 0.081, trunk: 0.497, thigh: 0.2, shank: 0.093, foot: 0.029, upperArm: 0.056, forearm: 0.044 } as const;

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Avanza `length` en la dirección `deg`, medida desde la vertical hacia arriba y en sentido horario. */
function step(from: Point, deg: number, length: number): Point {
  return { x: from.x + length * Math.sin(rad(deg)), y: from.y - length * Math.cos(rad(deg)) };
}

const mid = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

/** Keypoints con el tobillo en `ankle`; el pie queda apoyado en horizontal. */
export function solvePose(angles: PoseAngles, ankle: Point = { x: 0, y: 0 }): Keypoints {
  const knee = step(ankle, angles.shank, SEGMENTS.shank);
  const thighDir = angles.shank - angles.knee;
  const hip = step(knee, thighDir, SEGMENTS.thigh);
  const trunkDir = thighDir + angles.hip;
  const shoulder = step(hip, trunkDir, SEGMENTS.trunk);
  const neck = step(shoulder, trunkDir, SEGMENTS.neck);
  const head = step(neck, trunkDir, SEGMENTS.head);
  const armDir = trunkDir + 180 - angles.shoulder;
  const elbow = step(shoulder, armDir, SEGMENTS.upperArm);
  const wrist = step(elbow, armDir - angles.elbow, SEGMENTS.forearm);
  return {
    head, neck, shoulder, elbow, wrist, hip, knee, ankle,
    heel: { x: ankle.x - SEGMENTS.heel, y: ankle.y },
    toe: { x: ankle.x + SEGMENTS.foot - SEGMENTS.heel, y: ankle.y },
  };
}

/** Centro de gravedad: promedio de los centros de segmento ponderado por su masa. */
export function centerOfMass(k: Keypoints): Point {
  const parts: [Point, number][] = [
    [k.head, MASS.head],
    [mid(k.hip, k.neck), MASS.trunk],
    [mid(k.hip, k.knee), MASS.thigh],
    [mid(k.knee, k.ankle), MASS.shank],
    [mid(k.heel, k.toe), MASS.foot],
    [mid(k.shoulder, k.elbow), MASS.upperArm],
    [mid(k.elbow, k.wrist), MASS.forearm],
  ];
  const total = parts.reduce((sum, [, mass]) => sum + mass, 0);
  return {
    x: parts.reduce((sum, [p, mass]) => sum + p.x * mass, 0) / total,
    y: parts.reduce((sum, [p, mass]) => sum + p.y * mass, 0) / total,
  };
}

/** Ángulo interior en `vertex`, en grados (180 es una línea recta). */
export function interiorAngle(a: Point, vertex: Point, b: Point): number {
  const v1 = { x: a.x - vertex.x, y: a.y - vertex.y };
  const v2 = { x: b.x - vertex.x, y: b.y - vertex.y };
  const cos = (v1.x * v2.x + v1.y * v2.y) / (Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y));
  return (Math.acos(Math.min(1, Math.max(-1, cos))) * 180) / Math.PI;
}

/** Huesos del esqueleto, como pares de keypoints. */
export const BONES: [Joint, Joint][] = [
  ["heel", "toe"], ["ankle", "knee"], ["knee", "hip"], ["hip", "shoulder"], ["shoulder", "neck"],
  ["shoulder", "elbow"], ["elbow", "wrist"],
];

/** Una postura y cuánto se despega el tobillo del suelo. */
export type Phase = { angles: PoseAngles; lift: number };

/** Salto con contramovimiento: de pie, bajada, impulso, despegue, vuelo y aterrizaje. */
export const JUMP_PHASES: Phase[] = [
  { angles: { shank: 0, knee: 0, hip: 0, shoulder: 0, elbow: 10 }, lift: 0 },
  { angles: { shank: 22, knee: 62, hip: 70, shoulder: -45, elbow: 10 }, lift: 0 },
  { angles: { shank: 30, knee: 95, hip: 105, shoulder: -60, elbow: 5 }, lift: 0 },
  { angles: { shank: 16, knee: 40, hip: 40, shoulder: 70, elbow: 15 }, lift: 0 },
  { angles: { shank: 2, knee: 4, hip: 4, shoulder: 165, elbow: 10 }, lift: 6 },
  { angles: { shank: 0, knee: 18, hip: 22, shoulder: 170, elbow: 20 }, lift: 26 },
  { angles: { shank: 4, knee: 14, hip: 18, shoulder: 110, elbow: 15 }, lift: 8 },
  { angles: { shank: 24, knee: 72, hip: 72, shoulder: 55, elbow: 20 }, lift: 0 },
];

/** Sentadilla: de pie a la profundidad máxima y de vuelta, con los brazos al frente. */
export const SQUAT_PHASES: Phase[] = [
  { angles: { shank: 0, knee: 0, hip: 0, shoulder: 80, elbow: 0 }, lift: 0 },
  { angles: { shank: 14, knee: 45, hip: 50, shoulder: 85, elbow: 0 }, lift: 0 },
  { angles: { shank: 26, knee: 85, hip: 95, shoulder: 90, elbow: 0 }, lift: 0 },
  { angles: { shank: 32, knee: 115, hip: 120, shoulder: 90, elbow: 0 }, lift: 0 },
  { angles: { shank: 26, knee: 85, hip: 95, shoulder: 90, elbow: 0 }, lift: 0 },
  { angles: { shank: 14, knee: 45, hip: 50, shoulder: 85, elbow: 0 }, lift: 0 },
  { angles: { shank: 0, knee: 0, hip: 0, shoulder: 80, elbow: 0 }, lift: 0 },
];

export type Frame = { keypoints: Keypoints; center: Point };

/** Cada fase resuelta y desplazada `spacing` a la derecha, como en una placa de Marey. */
export function sequence(phases: Phase[], spacing: number, ground: number): Frame[] {
  return phases.map(({ angles, lift }, index) => {
    const keypoints = solvePose(angles, { x: index * spacing, y: ground - lift });
    return { keypoints, center: centerOfMass(keypoints) };
  });
}

/** Caja que contiene todas las poses, con margen; el suelo (y = 0) queda dentro. */
export function frameBounds(frames: Keypoints[], padding: number): { x: number; y: number; width: number; height: number } {
  const points = frames.flatMap((keypoints) => Object.values(keypoints));
  const [minX, maxX] = [Math.min(...points.map((p) => p.x)), Math.max(...points.map((p) => p.x))];
  const [minY, maxY] = [Math.min(...points.map((p) => p.y)), Math.max(0, ...points.map((p) => p.y))];
  return { x: minX - padding, y: minY - padding, width: maxX - minX + 2 * padding, height: maxY - minY + 2 * padding };
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Curva suave que pasa por todos los puntos (Catmull-Rom convertida a Bézier cúbicas). */
export function smoothPath(points: Point[]): string {
  if (points.length === 0) return "";
  let d = `M${round(points[0].x)} ${round(points[0].y)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [p0, p1, p2, p3] = [points[i - 1] ?? points[i], points[i], points[i + 1], points[i + 2] ?? points[i + 1]];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${round(c1.x)} ${round(c1.y)} ${round(c2.x)} ${round(c2.y)} ${round(p2.x)} ${round(p2.y)}`;
  }
  return d;
}
