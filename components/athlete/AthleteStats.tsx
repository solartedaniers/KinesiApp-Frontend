import { RiskInstruments } from "@/components/analysis/RiskInstruments";

import { myAnalyses } from "./AthleteData";

/** Estadísticas propias del deportista con los instrumentos de la guía. */
export async function AthleteStats() {
  return <RiskInstruments analyses={await myAnalyses()} voice="self" />;
}
