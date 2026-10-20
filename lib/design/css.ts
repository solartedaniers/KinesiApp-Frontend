import type { CSSProperties } from "react";

/** Variables CSS en línea (--angle, --to, --i...): React las acepta, pero su tipo no las declara. */
export function cssVars(vars: Record<`--${string}`, string | number>): CSSProperties {
  return vars as CSSProperties;
}
