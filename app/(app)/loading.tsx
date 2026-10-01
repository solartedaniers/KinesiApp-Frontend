import { PageSkeleton } from "@/components/app/Skeleton";

// Mientras se resuelve la guarda de rol y llega el primer chunk de cualquier página autenticada
export default function Loading() {
  return <PageSkeleton />;
}
