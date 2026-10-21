import "server-only";

import { timestampDate } from "@bufbuild/protobuf/wkt";
import { type Client, createClient } from "@connectrpc/connect";

import { SystemService } from "@/lib/gen/kinesiapp/system/v1/system_pb";

import type { AiState, ClientPolicy } from "../types";
import { toAiState } from "./mappers";
import { authedTransport, grpcTransport } from "./transport";

export type PingResult = { message: string; serverTime: Date | null; roundTripMs: number };

/** Adaptador de kinesiapp.system.v1.SystemService: el resto de la app no ve tipos de Protobuf. */
export class SystemGateway {
  constructor(
    private readonly anonymous: Client<typeof SystemService>,
    private readonly authenticated: Client<typeof SystemService>,
  ) {}

  async ping(message: string): Promise<PingResult> {
    const startedAt = performance.now();
    const response = await this.anonymous.ping({ message });
    return {
      message: response.message,
      serverTime: response.serverTime ? timestampDate(response.serverTime) : null,
      roundTripMs: Math.round(performance.now() - startedAt),
    };
  }

  async clientPolicy(): Promise<ClientPolicy> {
    const policy = await this.anonymous.getClientPolicy({});
    return {
      video_consent_version: policy.videoConsentVersion,
      video_max_duration_seconds: policy.video?.maxDurationSeconds ?? 0,
      video_max_size_bytes: Number(policy.video?.maxSizeBytes ?? 0),
      max_avatar_size_bytes: Number(policy.maxAvatarSizeBytes),
      password_min_length: policy.password?.minLength ?? 0,
      password_max_length: policy.password?.maxLength ?? 0,
      athlete_min_age_years: policy.athleteMinAgeYears,
      athlete_max_age_years: policy.athleteMaxAgeYears,
      chat_message_max_chars: policy.chatMessageMaxChars,
      min_height_cm: policy.biometrics?.minHeightCm ?? 0,
      max_height_cm: policy.biometrics?.maxHeightCm ?? 0,
      min_weight_kg: policy.biometrics?.minWeightKg ?? 0,
      max_weight_kg: policy.biometrics?.maxWeightKg ?? 0,
    };
  }

  /** Despierta la IA; si no responde, el backend devuelve UNAVAILABLE y lo dejo subir a quien llama. */
  async wakeUpAi(timeoutMs: number): Promise<AiState> {
    return toAiState((await this.authenticated.wakeUpAi({}, { timeoutMs })).state);
  }
}

export function systemGateway(): SystemGateway {
  return new SystemGateway(createClient(SystemService, grpcTransport()), createClient(SystemService, authedTransport()));
}
