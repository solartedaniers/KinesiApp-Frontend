import 'package:cross_file/cross_file.dart';

/// Datos que viajan grabación → subida → estado. [analysisId] lo asigna el
/// backend al terminar la subida.
class AnalysisFlow {
  const AnalysisFlow({
    required this.athleteId,
    required this.video,
    this.analysisId,
  });
  final int athleteId;
  final XFile video;
  final int? analysisId;

  AnalysisFlow withAnalysisId(int id) =>
      AnalysisFlow(athleteId: athleteId, video: video, analysisId: id);
}
