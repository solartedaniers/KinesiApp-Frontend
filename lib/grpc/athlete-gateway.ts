import "server-only";

import { type Client, createClient } from "@connectrpc/connect";

import { AthleteProfileService } from "@/lib/gen/kinesiapp/athlete/v1/athlete_profile_service_pb";
import { ManagedAthleteService } from "@/lib/gen/kinesiapp/athlete/v1/managed_athlete_service_pb";

import type { BiometricsPayload } from "../biometrics";
import type { AthleteProfile, UploadTarget } from "../types";
import { GENDER, toAthlete, toCalendarDate } from "./mappers";
import { collectPages } from "./pages";
import { IMAGE_TYPE, type ImageType, toUploadTarget } from "./uploads";
import { authedTransport } from "./transport";

function toBiometrics(payload: BiometricsPayload) {
  return {
    gender: GENDER[payload.gender],
    heightCm: payload.height_cm,
    weightKg: payload.weight_kg,
    birthDate: toCalendarDate(payload.birth_date),
  };
}

/** Adaptador de kinesiapp.athlete.v1.AthleteProfileService: fichas de deportistas con cuenta. */
class AthleteGateway {
  constructor(private readonly client: Client<typeof AthleteProfileService>) {}

  async mine(): Promise<AthleteProfile> {
    return toAthlete((await this.client.getMyAthleteProfile({})).athlete);
  }

  async createMine(biometrics: BiometricsPayload): Promise<AthleteProfile> {
    return toAthlete((await this.client.createMyAthleteProfile({ biometrics: toBiometrics(biometrics) })).athlete);
  }

  async updateMine(biometrics: BiometricsPayload): Promise<AthleteProfile> {
    return toAthlete((await this.client.updateMyAthleteProfile({ biometrics: toBiometrics(biometrics) })).athlete);
  }

  async get(athleteId: string): Promise<AthleteProfile> {
    return toAthlete((await this.client.getAthleteProfile({ athleteId })).athlete);
  }

  async coached(): Promise<AthleteProfile[]> {
    return (await this.client.listCoachedAthletes({})).athletes.map(toAthlete);
  }

  async all(pageSize: number): Promise<AthleteProfile[]> {
    return collectPages(async (page) => {
      const response = await this.client.listAthletes({ page: { pageSize, pageToken: page } });
      return { items: response.athletes.map(toAthlete), next: response.page?.nextPageToken ?? "" };
    });
  }

  async assignCoach(athleteId: string, coachId: string): Promise<AthleteProfile> {
    return toAthlete((await this.client.assignCoach({ athleteId, coachId })).athlete);
  }
}

/** Adaptador de kinesiapp.athlete.v1.ManagedAthleteService: los deportistas sin cuenta de un coach. */
class ManagedAthleteGateway {
  constructor(private readonly client: Client<typeof ManagedAthleteService>) {}

  async list(): Promise<AthleteProfile[]> {
    return (await this.client.listManagedAthletes({})).athletes.map(toAthlete);
  }

  async create(fullName: string, biometrics: BiometricsPayload): Promise<AthleteProfile> {
    return toAthlete((await this.client.createManagedAthlete({ fullName, biometrics: toBiometrics(biometrics) })).athlete);
  }

  async update(athleteId: string, fullName: string, biometrics: BiometricsPayload): Promise<AthleteProfile> {
    const response = await this.client.updateManagedAthlete({ athleteId, fullName, biometrics: toBiometrics(biometrics) });
    return toAthlete(response.athlete);
  }

  async delete(athleteId: string): Promise<void> {
    await this.client.deleteManagedAthlete({ athleteId });
  }

  async createAvatarUpload(athleteId: string, type: ImageType, size: number): Promise<UploadTarget> {
    const response = await this.client.createManagedAthleteAvatarUpload({
      athleteId,
      contentType: IMAGE_TYPE[type],
      contentLength: BigInt(size),
    });
    return toUploadTarget(response.uploadId, response.target);
  }

  async confirmAvatarUpload(athleteId: string, uploadId: string): Promise<AthleteProfile> {
    return toAthlete((await this.client.confirmManagedAthleteAvatarUpload({ athleteId, uploadId })).athlete);
  }

  async deleteAvatar(athleteId: string): Promise<AthleteProfile> {
    return toAthlete((await this.client.deleteManagedAthleteAvatar({ athleteId })).athlete);
  }
}

export function athleteGateway(): AthleteGateway {
  return new AthleteGateway(createClient(AthleteProfileService, authedTransport()));
}

export function managedAthleteGateway(): ManagedAthleteGateway {
  return new ManagedAthleteGateway(createClient(ManagedAthleteService, authedTransport()));
}
