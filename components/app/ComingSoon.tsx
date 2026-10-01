import { t } from "@/lib/i18n";

import { EmptyState } from "./EmptyState";

/** Secciones que llegan en fases siguientes. */
export function ComingSoon() {
  return <EmptyState icon="clock" title={t.comingSoon.title} body={t.comingSoon.body} />;
}
