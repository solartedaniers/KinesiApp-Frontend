import 'jump_analysis_status.dart';
import 'jump_analysis_summary.dart';

/// Métricas agregadas de una lista de análisis (pestañas de estadísticas).
/// Pura, sin Flutter: se calcula una vez por lista y se testea aislada.
class AnalysisStatistics {
  AnalysisStatistics(List<JumpAnalysisSummary> analyses)
    : total = analyses.length,
      pending = _count(analyses, JumpAnalysisStatus.pending),
      processed = _count(analyses, JumpAnalysisStatus.processed),
      failed = _count(analyses, JumpAnalysisStatus.failed),
      _scores = [
        for (final analysis in analyses)
          if (analysis.riskScore != null) analysis.riskScore!,
      ],
      lastRecordedAt = analyses.isEmpty
          ? null
          : analyses
                .map((analysis) => analysis.recordedAt)
                .reduce((a, b) => a.isAfter(b) ? a : b);

  /// El backend acota `risk_score` a [0, 1]; desde aquí se considera alto.
  static const double highRiskThreshold = 0.66;

  final int total;
  final int pending;
  final int processed;
  final int failed;
  final DateTime? lastRecordedAt;
  final List<double> _scores;

  double? get averageRisk =>
      _scores.isEmpty ? null : _scores.reduce((a, b) => a + b) / _scores.length;

  double? get highestRisk =>
      _scores.isEmpty ? null : _scores.reduce((a, b) => a > b ? a : b);

  int get highRiskCount =>
      _scores.where((score) => score >= highRiskThreshold).length;

  static int _count(
    List<JumpAnalysisSummary> analyses,
    JumpAnalysisStatus status,
  ) => analyses.where((analysis) => analysis.status == status).length;
}
