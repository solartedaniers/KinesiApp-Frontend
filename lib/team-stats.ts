// Estadísticas por equipo: lógica pura (sin React ni red), testeada en team-stats.test.ts.
import { computeStatistics, type AnalysisStatistics } from "./analysis-stats.ts";
import type { AthleteProfile, JumpAnalysis, Team } from "./types.ts";

/** Deportistas y grabaciones de un equipo; sin equipo, todo lo del coach. */
export function scopeToTeam(
  athletes: AthleteProfile[],
  analyses: JumpAnalysis[],
  team: Team | undefined,
): { athletes: AthleteProfile[]; analyses: JumpAnalysis[] } {
  if (!team) return { athletes, analyses };
  const members = new Set(team.athlete_ids);
  return {
    athletes: athletes.filter((athlete) => members.has(athlete.id)),
    analyses: analyses.filter((analysis) => members.has(analysis.athlete_id)),
  };
}

export type TeamSummary = { team: Team; athletes: number; stats: AnalysisStatistics };

/** Una fila por equipo para compararlos (un deportista en dos equipos cuenta en ambos). */
export function statsByTeam(teams: Team[], analyses: JumpAnalysis[]): TeamSummary[] {
  return teams.map((team) => {
    const members = new Set(team.athlete_ids);
    return {
      team,
      athletes: team.athlete_ids.length,
      stats: computeStatistics(analyses.filter((analysis) => members.has(analysis.athlete_id))),
    };
  });
}

/** `?team=` de la URL → el equipo, sólo si es uno de los del usuario. */
export function findTeam(teams: Team[], param: string | string[] | undefined): Team | undefined {
  const teamId = Number(Array.isArray(param) ? param[0] : param);
  return teams.find((team) => team.id === teamId);
}
