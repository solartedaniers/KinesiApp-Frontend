"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";

import { Icon } from "@/components/ui/Icon";
import { useT } from "@/lib/i18n/client";

import styles from "./MobileMenu.module.css";

/**
 * Menú hamburguesa del celular: un <dialog> modal que se desliza desde el costado. El navegador
 * resuelve el foco atrapado, Escape y el fondo inerte. Se cierra al navegar, al tocar el fondo o
 * con el botón. El contenido (NavigationPanel) lo renderiza el servidor.
 */
export function MobileMenu({ children }: { children: ReactNode }) {
  const t = useT();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  // Navegar desde el menú (o con atrás/adelante) lo cierra
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-label={t.nav.openMenu}
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        <Icon name="menu" />
      </button>
      <dialog
        ref={dialogRef}
        className={styles.drawer}
        aria-label={t.nav.menu}
        // El clic llega al <dialog> sólo desde el fondo: el panel lo ocupa entero
        onClick={(event) => event.target === event.currentTarget && event.currentTarget.close()}
      >
        <div className={styles.panel}>
          <div className={styles.header}>
            <span className={styles.title}>{t.nav.menu}</span>
            <button type="button" className={styles.close} aria-label={t.nav.closeMenu} onClick={() => dialogRef.current?.close()}>
              <Icon name="close" />
            </button>
          </div>
          {children}
        </div>
      </dialog>
    </>
  );
}
