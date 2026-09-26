import 'package:cross_file/cross_file.dart';

class AnalysisFlow {
  const AnalysisFlow({
    required this.athleteId,
    required this.analysisId,
    required this.video,
  });
  final int athleteId;
  final int analysisId;
  final XFile video;
}
