import 'jump_analysis_status.dart';

/// DTO resumido de JumpAnalysisRead (backend `app/schemas/jump_analysis.py`);
/// las listas de la app no necesitan el detalle de `angle_measurements`.
class JumpAnalysisSummary {
  const JumpAnalysisSummary({
    required this.id,
    required this.status,
    required this.riskScore,
    required this.recordedAt,
  });

  final int id;
  final JumpAnalysisStatus status;
  final double? riskScore;
  final DateTime recordedAt;

  factory JumpAnalysisSummary.fromJson(Map<String, dynamic> json) =>
      JumpAnalysisSummary(
        id: json['id'] as int,
        status: JumpAnalysisStatus.fromApiValue(json['status'] as String),
        riskScore: (json['risk_score'] as num?)?.toDouble(),
        recordedAt: DateTime.parse(json['recorded_at'] as String),
      );
}
