import type { CSSProperties } from "react";

import { CenterOfMassMark } from "./CenterOfMassMark";
import { Skeleton } from "./Skeleton";

import { type Phase, sequence, smoothPath } from "@/lib/design/pose";

const SPACING = 30;
const PADDING = 12;

const styles = {
  figure: "text-ink",
  bones: "stroke-ink [stroke-width:1.6]",
  ground: "stroke-line-strong [stroke-width:0.8]",
  trajectory: "lab-draw fill-none stroke-accent [stroke-width:1.4]",
};

/**
 * Cronofotografía a la manera de Marey: las fases de un movimiento superpuestas en una sola placa,
 * cada una más opaca que la anterior, con la trayectoria del centro de gravedad uniendo sus marcas.
 * Cada pose se traza después de la anterior: la placa se "expone" de izquierda a derecha.
 */
export function Chronophotograph({ phases, label, className }: { phases: Phase[]; label: string; className?: string }) {
  const frames = sequence(phases, SPACING, 0);
  const xs = frames.flatMap(({ keypoints }) => Object.values(keypoints).map((p) => p.x));
  const ys = frames.flatMap(({ keypoints }) => Object.values(keypoints).map((p) => p.y));
  const [minX, maxX, minY] = [Math.min(...xs) - PADDING, Math.max(...xs) + PADDING, Math.min(...ys) - PADDING];
  const viewBox = `${minX} ${minY} ${maxX - minX} ${PADDING - minY}`;

  return (
    <svg viewBox={viewBox} role="img" aria-label={label} className={`${styles.figure} ${className ?? ""}`}>
      <line className={styles.ground} x1={minX} x2={maxX} y1={0.5} y2={0.5} />
      {frames.map(({ keypoints }, index) => (
        <Skeleton
          key={index}
          keypoints={keypoints}
          step={index}
          className={styles.bones}
          // La última pose es la más presente; las primeras quedan como estela
          opacity={0.3 + (0.7 * index) / Math.max(1, frames.length - 1)}
        />
      ))}
      <path
        className={styles.trajectory}
        pathLength={1}
        style={{ "--lab-step": frames.length } as CSSProperties}
        d={smoothPath(frames.map(({ center }) => center))}
      />
      {frames.map(({ center }, index) => (
        <CenterOfMassMark key={index} x={center.x} y={center.y} size={5} />
      ))}
    </svg>
  );
}
