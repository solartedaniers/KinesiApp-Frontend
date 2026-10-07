const styles = {
  block: "animate-pulse rounded-panel bg-sunken motion-reduce:animate-none",
  tiles: "grid grid-cols-2 gap-3 lg:grid-cols-4",
  tile: "h-24",
  stack: "grid gap-4",
  row: "h-16",
  chart: "aspect-video w-full",
  title: "h-9 w-64 max-w-full",
};

/** Esqueletos de carga: fallback de Suspense y de loading.tsx mientras llega el stream (§10.2). */
export function TilesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={styles.tiles} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={`${styles.block} ${styles.tile}`} />
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className={styles.stack} aria-hidden>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className={`${styles.block} ${styles.row}`} />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return <div className={`${styles.block} ${styles.chart}`} aria-hidden />;
}

export function TitleSkeleton() {
  return <div className={`${styles.block} ${styles.title}`} aria-hidden />;
}

export function PageSkeleton() {
  return (
    <div className={styles.stack} aria-busy>
      <TitleSkeleton />
      <TilesSkeleton />
      <ListSkeleton />
    </div>
  );
}
