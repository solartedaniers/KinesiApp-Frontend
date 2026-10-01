import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost";

type StyleProps = { variant?: Variant; block?: boolean };

function classes({ variant = "primary", block }: StyleProps, extra?: string): string {
  return [styles.button, styles[variant], block && styles.block, extra].filter(Boolean).join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  StyleProps & {
    /** Muestra el indicador de carga, deshabilita el botón y cambia el texto. */
    pending?: boolean;
    pendingLabel?: string;
  };

export function Button({ variant, block, pending, pendingLabel, children, className, disabled, ...rest }: ButtonProps) {
  return (
    <button className={classes({ variant, block }, className)} disabled={disabled || pending} {...rest}>
      {pending && <span className={styles.spinner} aria-hidden />}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

export function ButtonLink({ variant, block, className, ...rest }: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={classes({ variant, block }, className)} {...rest} />;
}
