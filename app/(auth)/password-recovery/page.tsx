import { notFound } from "next/navigation";

// Fase 1: recuperación en 3 pasos en una sola ruta, CSR (§3). Ver docs/design/web-frontend-architecture.md.
export default function Page() {
  notFound();
}
