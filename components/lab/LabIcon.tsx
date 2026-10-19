import { LAB_ICONS, type LabIconName } from "@/lib/design/icons";

/** Ícono del laboratorio. Decorativo por defecto: el texto del control dice qué hace. */
export function LabIcon({ name, size = 20, label, className }: { name: LabIconName; size?: number; label?: string; className?: string }) {
  const { d, dots } = LAB_ICONS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      className={className}
    >
      <path d={d} />
      {dots?.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.5} fill="currentColor" stroke="none" />)}
    </svg>
  );
}
