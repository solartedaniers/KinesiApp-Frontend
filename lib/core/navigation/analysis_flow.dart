import 'package:cross_file/cross_file.dart';

import '../../models/jump_analysis/movement_type.dart';

/// Datos que viajan grabación → subida → estado. [analysisId] lo asigna el
/// backend al terminar la subida.
class AnalysisFlow {
  const AnalysisFlow({
    required this.athleteId,
    required this.video,
    required this.movementType,
    this.analysisId,
  });
  final int athleteId;
  final XFile video;
  final MovementType movementType;
  final int? analysisId;

  AnalysisFlow withAnalysisId(int id) => AnalysisFlow(
    athleteId: athleteId,
    video: video,
    movementType: movementType,
    analysisId: id,
  );
}
