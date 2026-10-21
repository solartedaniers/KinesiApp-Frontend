import { getPlaybackUrl } from "@/lib/data/analyses";
import { getRiskCuts } from "@/lib/data/public";
import type { JumpAnalysis } from "@/lib/types";

import { VideoTimeline } from "./VideoTimeline";

/** Pide la URL firmada en el servidor (GetVideoPlaybackUrl) y entrega la línea de tiempo con el video. */
export async function AnalysisVideoPanel({ analysis }: { analysis: JumpAnalysis }) {
  const [initial, cuts] = await Promise.all([getPlaybackUrl(analysis.id), getRiskCuts()]);
  return (
    <VideoTimeline
      analysisId={analysis.id}
      initial={initial}
      measurements={analysis.angle_measurements}
      assessment={analysis.risk_assessment}
      cuts={cuts}
      target={analysis.knee_target}
      movement={analysis.movement_type}
    />
  );
}
