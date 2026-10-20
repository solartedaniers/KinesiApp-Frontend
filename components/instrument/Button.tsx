import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { Glyph } from "./Glyph";

import type { GlyphName } from "@/lib/design/icons";

type Variant = "primary" | "secondary" | "quiet";
type Look = { variant?: Variant; glyph?: GlyphName; block?: boolean };

const VARIANT: Record<Variant, string> = {
  primary: "kin-btn-primary",
  secondary: "kin-btn-secondary",
  quiet: "kin-btn-quiet text-accent hover:bg-accent-soft",
};

const classes = (variant: Variant, block = false, extra = "") =>
  `kin-btn ${VARIANT[variant]} inline-flex min-h-11 items-center justify-center gap-2 rounded-panel px-5 text-sm font-semibold ` +
  `disabled:cursor-not-allowed disabled:not-aria-busy:opacity-60 ${block ? "w-full" : ""} ${extra}`;

/** Aguja que oscila mientras la acción espera: el mismo lenguaje del medidor en miniatura. */
function PendingNeedle() {
  return (
    <svg viewBox="0 0 20 20" className="size-5" aria-hidden>
      <path d="M3.5 14a6.5 6.5 0 0 1 13 0" className="fill-none stroke-current opacity-40" strokeWidth="1.6" strokeLinecap="round" />
      <g className="kin-oscillate origin-[10px_14px] [transform-box:view-box]">
        <path d="M10 14L10 6" className="stroke-current" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      <circle cx="10" cy="14" r="1.6" className="fill-current" />
    </svg>
  );
}

function Content({ glyph, pending, children }: { glyph?: GlyphName; pending?: boolean; children: ReactNode }) {
  return (
    <>
      {pending ? <PendingNeedle /> : glyph && <Glyph name={glyph} size={18} />}
      <span>{children}</span>
    </>
  );
}

export function Button({ variant = "primary", glyph, block, pending = false, className, children, ...props }: Look & { pending?: boolean } & ComponentProps<"button">) {
  return (
    <button type="button" className={classes(variant, block, className)} aria-busy={pending || undefined} disabled={pending || props.disabled} {...props}>
      <Content glyph={glyph} pending={pending}>{children}</Content>
    </button>
  );
}

export function ButtonLink({ variant = "primary", glyph, block, className, children, ...props }: Look & ComponentProps<typeof Link>) {
  return (
    <Link className={classes(variant, block, className)} {...props}>
      <Content glyph={glyph}>{children}</Content>
    </Link>
  );
}
