import "server-only";

import { type Client, createClient } from "@connectrpc/connect";

import { AnalysisService } from "@/lib/gen/kinesiapp/analysis/v1/analysis_pb";

import type { AnalysisSummary, JumpAnalysis, MovementType, SignedUrl, UploadTarget } from "../types";
import { grpcEnv } from "./env";
import { MOVEMENT, toAnalysis, toAnalysisSummary, toProgress, toSignedUrl } from "./mappers";
import { collectPages } from "./pages";
import { toUploadTarget } from "./uploads";
import { authedTransport } from "./transport";
import type { AnalysisEvent } from "../analysis-events";

export type VideoUpload = {
  athleteId: string;
  movementType: MovementType;
  contentType: string;
  size: number;
  durationMs: number;
};

/** Adaptador de kinesiapp.analysis.v1.AnalysisService. */
export class AnalysisGateway {
  constructor(
    private readonly client: Client<typeof AnalysisService>,
    private readonly streamTimeoutMs: number,
  ) {}

  async createVideoUpload(upload: VideoUpload): Promise<UploadTarget> {
    const response = await this.client.createVideoUpload({
      athleteId: upload.athleteId,
      movementType: MOVEMENT[upload.movementType],
      contentType: upload.contentType,
      contentLength: BigInt(upload.size),
      durationMs: upload.durationMs,
    });
    return toUploadTarget(response.uploadId, response.target);
  }

  async confirmVideoUpload(uploadId: string): Promise<AnalysisSummary> {
    return toAnalysisSummary((await this.client.confirmVideoUpload({ uploadId })).analysis);
  }

  /** Progreso en vivo hasta el resultado; el último evento siempre es "finished". */
  async *watch(analysisId: string, signal?: AbortSignal): AsyncGenerator<AnalysisEvent> {
    for await (const response of this.client.watchAnalysis({ analysisId }, { timeoutMs: this.streamTimeoutMs, signal })) {
      if (response.event.case === "progress") yield { kind: "progress", progress: toProgress(response.event.value) };
      if (response.event.case === "finished") yield { kind: "finished", analysis: toAnalysisSummary(response.event.value) };
    }
  }

  async get(analysisId: string): Promise<JumpAnalysis> {
    return toAnalysis((await this.client.getAnalysis({ analysisId })).analysis);
  }

  async byAthlete(athleteId: string, pageSize: number): Promise<AnalysisSummary[]> {
    return collectPages(async (page) => {
      const response = await this.client.listAthleteAnalyses({ athleteId, page: { pageSize, pageToken: page } });
      return { items: response.analyses.map(toAnalysisSummary), next: response.page?.nextPageToken ?? "" };
    });
  }

  async coached(pageSize: number, teamId?: string): Promise<AnalysisSummary[]> {
    return collectPages(async (page) => {
      const response = await this.client.listCoachedAnalyses({ teamId, page: { pageSize, pageToken: page } });
      return { items: response.analyses.map(toAnalysisSummary), next: response.page?.nextPageToken ?? "" };
    });
  }

  async delete(analysisId: string): Promise<void> {
    await this.client.deleteAnalysis({ analysisId });
  }

  async playbackUrl(analysisId: string): Promise<SignedUrl> {
    const { video } = await this.client.getVideoPlaybackUrl({ analysisId });
    if (!video) throw new Error("The backend did not return a playback URL");
    return toSignedUrl(video);
  }
}

export function analysisGateway(): AnalysisGateway {
  return new AnalysisGateway(createClient(AnalysisService, authedTransport()), grpcEnv().GRPC_STREAM_TIMEOUT_MS);
}
