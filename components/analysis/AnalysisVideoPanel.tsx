import { AnalysisVideo } from "@/components/AnalysisVideo";
import { publicApiBaseUrl } from "@/lib/config";
import { getVideoAccess } from "@/lib/data/analyses";
import { videoSource } from "@/lib/video";

/** Pide la URL firmada en el servidor (Bearer desde la cookie) y entrega el <video> ya listo. */
export async function AnalysisVideoPanel({ analysisId }: { analysisId: number }) {
  const access = await getVideoAccess(analysisId);
  return <AnalysisVideo analysisId={analysisId} initial={videoSource(publicApiBaseUrl(), analysisId, access)} />;
}
