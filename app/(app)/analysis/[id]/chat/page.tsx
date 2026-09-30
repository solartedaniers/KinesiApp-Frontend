import { notFound } from "next/navigation";

// Bloqueada: espera los endpoints de chat del backend (§3, §11). Ver docs/design/web-frontend-architecture.md.
export default function Page() {
  notFound();
}
