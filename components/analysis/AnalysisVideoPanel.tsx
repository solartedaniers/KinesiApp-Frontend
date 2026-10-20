import { AnalysisVideo } from "@/components/AnalysisVideo";
import { riskLevel } from "@/lib/analysis-stats";
import { getPlaybackUrl } from "@/lib/data/analyses";
import type { JumpAnalysis } from "@/lib/types";

/** Pide la URL firmada en el servidor (GetVideoPlaybackUrl) y entrega el <video> ya listo. */
export async function AnalysisVideoPanel({ analysis }: { analysis: JumpAnalysis }) {
  const video = await getPlaybackUrl(analysis.id);
  return (
    <AnalysisVideo
      analysisId={analysis.id}
      initial={video}
      measurements={analysis.angle_measurements}
      risk={analysis.risk_score === null ? undefined : riskLevel(analysis.risk_score)}
    />
  );
}
