import { AnalysisVideo } from "@/components/AnalysisVideo";
import { riskLevel } from "@/lib/analysis-stats";
import { publicApiBaseUrl } from "@/lib/config";
import { getVideoAccess } from "@/lib/data/analyses";
import type { JumpAnalysis } from "@/lib/types";
import { videoSource } from "@/lib/video";

/** Pide la URL firmada en el servidor (Bearer desde la cookie) y entrega el <video> ya listo. */
export async function AnalysisVideoPanel({ analysis }: { analysis: JumpAnalysis }) {
  const access = await getVideoAccess(analysis.id);
  return (
    <AnalysisVideo
      analysisId={analysis.id}
      initial={videoSource(publicApiBaseUrl(), analysis.id, access)}
      measurements={analysis.angle_measurements}
      risk={analysis.risk_score === null ? undefined : riskLevel(analysis.risk_score)}
    />
  );
}
