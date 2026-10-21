import "server-only";

import { type Client, createClient } from "@connectrpc/connect";

import { TeamService } from "@/lib/gen/kinesiapp/team/v1/team_pb";

import type { Team, UploadTarget } from "../types";
import { toTeam } from "./mappers";
import { authedTransport } from "./transport";
import { IMAGE_TYPE, type ImageType, toUploadTarget } from "./uploads";

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

  async createLogoUpload(teamId: string, type: ImageType, size: number): Promise<UploadTarget> {
    const response = await this.client.createTeamLogoUpload({ teamId, contentType: IMAGE_TYPE[type], contentLength: BigInt(size) });
    return toUploadTarget(response.uploadId, response.target);
  }

  async confirmLogoUpload(teamId: string, uploadId: string): Promise<Team> {
    return toTeam((await this.client.confirmTeamLogoUpload({ teamId, uploadId })).team);
  }

  async deleteLogo(teamId: string): Promise<Team> {
    return toTeam((await this.client.deleteTeamLogo({ teamId })).team);
  }
}

export function teamGateway(): TeamGateway {
  return new TeamGateway(createClient(TeamService, authedTransport()));
}
