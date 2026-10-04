import type { CSSProperties } from "react";

import styles from "./AmbientScene.module.css";

const PARTICLE_COUNT = 64;

function getParticleStyle(index: number) {
  const x = (index * 47 + 13) % 100;
  const y = (index * 71 + 19) % 100;
  const depth = (index % 5) + 1;
  const delay = -((index * 0.73) % 18);
  const size = (index % 3) + 2;

  return {
    "--particle-x": `${x}%`,
    "--particle-y": `${y}%`,
    "--particle-depth": `${depth * 12}px`,
    "--particle-delay": `${delay}s`,
    "--particle-size": `${size}px`,
  } as CSSProperties;
}

export function AmbientScene() {
  return (
    <div className={styles.scene} aria-hidden="true">
      <div className={styles.orbitField}>
        <span className={styles.orbit} />
        <span className={`${styles.orbit} ${styles.orbitTilted}`} />
        <span className={styles.core} />
      </div>
      <div className={styles.particles}>
        {Array.from({ length: PARTICLE_COUNT }, (_, index) => (
          <span className={styles.particle} key={index} style={getParticleStyle(index)} />
        ))}
      </div>
    </div>
  );
}
