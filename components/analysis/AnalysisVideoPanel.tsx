import { getPlaybackUrl } from "@/lib/data/analyses";
import type { JumpAnalysis } from "@/lib/types";

import { VideoTimeline } from "./VideoTimeline";

/** Pide la URL firmada en el servidor (GetVideoPlaybackUrl) y entrega la línea de tiempo con el video. */
export async function AnalysisVideoPanel({ analysis }: { analysis: JumpAnalysis }) {
  return (
    <VideoTimeline
      analysisId={analysis.id}
      initial={await getPlaybackUrl(analysis.id)}
      measurements={analysis.angle_measurements}
      assessment={analysis.risk_assessment}
      target={analysis.knee_target}
      movement={analysis.movement_type}
    />
  );
}
