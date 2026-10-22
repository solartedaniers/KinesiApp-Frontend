import { GLYPHS, type GlyphName } from "@/lib/design/icons";

/** Ícono del registro. Decorativo por defecto: el texto del control dice qué hace. */
export function Glyph({ name, size = 20, label, className }: { name: GlyphName; size?: number; label?: string; className?: string }) {
  const { d, dots } = GLYPHS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      className={className}
    >
      <path d={d} />
      {dots?.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.6} fill="currentColor" stroke="none" />)}
    </svg>
  );
}
