import "server-only";

import { type Client, createClient } from "@connectrpc/connect";

import { TeamService } from "@/lib/gen/kinesiapp/team/v1/team_pb";

import type { Team } from "../types";
import { toTeam } from "./mappers";
import { authedTransport } from "./transport";

/** Adaptador de kinesiapp.team.v1.TeamService. */
export class TeamGateway {
  constructor(private readonly client: Client<typeof TeamService>) {}

  async list(): Promise<Team[]> {
    return (await this.client.listTeams({})).teams.map(toTeam);
  }

  async get(teamId: string): Promise<Team> {
    return toTeam((await this.client.getTeam({ teamId })).team);
  }

  async create(name: string): Promise<Team> {
    return toTeam((await this.client.createTeam({ name })).team);
  }

  async rename(teamId: string, name: string): Promise<Team> {
    return toTeam((await this.client.renameTeam({ teamId, name })).team);
  }

  async delete(teamId: string): Promise<void> {
    await this.client.deleteTeam({ teamId });
  }

  async addMember(teamId: string, athleteId: string): Promise<Team> {
    return toTeam((await this.client.addTeamMember({ teamId, athleteId })).team);
  }

  async removeMember(teamId: string, athleteId: string): Promise<Team> {
    return toTeam((await this.client.removeTeamMember({ teamId, athleteId })).team);
  }
}

export function teamGateway(): TeamGateway {
  return new TeamGateway(createClient(TeamService, authedTransport()));
}
