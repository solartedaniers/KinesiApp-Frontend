// Etiquetas de estado y de riesgo (antes analysis/Badge.module.css). Las de riesgo son las únicas
// que usan la escala risk-*; los estados del sistema usan el acento o neutros.
export const badgeStyles = {
  badge: "inline-flex items-center gap-1.5 whitespace-nowrap rounded-tag px-2 py-0.5 text-xs font-semibold leading-5",
  neutral: "bg-sunken text-ink-muted",
  positive: "bg-accent-soft text-accent",
  attention: "bg-panel text-ink ring-1 ring-inset ring-ink",
  low: "bg-risk-low-soft text-risk-low",
  moderate: "bg-risk-moderate-soft text-risk-moderate",
  high: "bg-risk-high-soft text-risk-high",
} as const;
