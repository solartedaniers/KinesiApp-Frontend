import type { CSSProperties } from "react";

import { BONES, type Keypoints, SEGMENTS } from "@/lib/design/pose";

const styles = {
  bone: "lab-draw",
  joint: "fill-[var(--kin-skeleton-fill,var(--kin-canvas))]",
};

/**
 * Esqueleto de keypoints en vista lateral, como lo traza MediaPipe: huesos rectos y articulaciones
 * huecas. Es un <g> para componerlo dentro de otra figura SVG; `step` escalona el trazado.
 */
export function Skeleton({ keypoints, step = 0, opacity, className }: { keypoints: Keypoints; step?: number; opacity?: number; className?: string }) {
  const head = keypoints.head;
  return (
    <g className={className} opacity={opacity} style={{ "--lab-step": step } as CSSProperties} strokeLinecap="round" strokeLinejoin="round">
      {BONES.map(([from, to]) => (
        <path
          key={`${from}-${to}`}
          className={styles.bone}
          pathLength={1}
          d={`M${keypoints[from].x} ${keypoints[from].y}L${keypoints[to].x} ${keypoints[to].y}`}
        />
      ))}
      <circle className={styles.bone} pathLength={1} cx={head.x} cy={head.y} r={SEGMENTS.head * 0.7} fill="none" />
      {(["shoulder", "elbow", "wrist", "hip", "knee", "ankle"] as const).map((joint) => (
        <circle key={joint} className={styles.joint} cx={keypoints[joint].x} cy={keypoints[joint].y} r={1.6} />
      ))}
    </g>
  );
}
