import 'jump_analysis_status.dart';
import 'movement_type.dart';

/// DTO resumido de JumpAnalysisRead (backend `app/schemas/jump_analysis.py`);
/// las listas de la app no necesitan el detalle de `angle_measurements`.
class JumpAnalysisSummary {
  const JumpAnalysisSummary({
    required this.id,
    required this.athleteId,
    required this.movementType,
    required this.status,
    required this.riskScore,
    required this.recordedAt,
  });

  final int id;
  final int athleteId;
  final MovementType movementType;
  final JumpAnalysisStatus status;
  final double? riskScore;
  final DateTime recordedAt;

  factory JumpAnalysisSummary.fromJson(Map<String, dynamic> json) =>
      JumpAnalysisSummary(
        id: json['id'] as int,
        athleteId: json['athlete_id'] as int,
        movementType: MovementType.fromApiValue(
          json['movement_type'] as String?,
        ),
        status: JumpAnalysisStatus.fromApiValue(json['status'] as String),
        riskScore: (json['risk_score'] as num?)?.toDouble(),
        recordedAt: DateTime.parse(json['recorded_at'] as String),
      );
}
