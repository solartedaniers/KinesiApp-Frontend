import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/models/avatar/avatar_data.dart';
import 'package:frontend/models/jump_analysis/analysis_statistics.dart';
import 'package:frontend/models/jump_analysis/jump_analysis_status.dart';
import 'package:frontend/models/jump_analysis/jump_analysis_summary.dart';
import 'package:frontend/models/jump_analysis/movement_type.dart';

JumpAnalysisSummary _analysis(
  JumpAnalysisStatus status,
  double? risk,
  DateTime at,
) => JumpAnalysisSummary(
  id: 1,
  athleteId: 1,
  movementType: MovementType.jump,
  status: status,
  riskScore: risk,
  recordedAt: at,
);

void main() {
  test('aggregates counts, risk and last recording date', () {
    final stats = AnalysisStatistics([
      _analysis(JumpAnalysisStatus.processed, 0.2, DateTime(2026, 1, 1)),
      _analysis(JumpAnalysisStatus.processed, 0.8, DateTime(2026, 3, 1)),
      _analysis(JumpAnalysisStatus.pending, null, DateTime(2026, 2, 1)),
    ]);

    expect(stats.total, 3);
    expect(stats.processed, 2);
    expect(stats.pending, 1);
    expect(stats.averageRisk, closeTo(0.5, 1e-9));
    expect(stats.highestRisk, 0.8);
    expect(stats.highRiskCount, 1);
    expect(stats.lastRecordedAt, DateTime(2026, 3, 1));
  });

  test('empty list has no risk metrics', () {
    final stats = AnalysisStatistics(const []);
    expect(stats.total, 0);
    expect(stats.averageRisk, isNull);
    expect(stats.lastRecordedAt, isNull);
  });

  test('avatar upload detects format by magic bytes and rejects others', () {
    final png = Uint8List.fromList([
      0x89,
      0x50,
      0x4E,
      0x47,
      0x0D,
      0x0A,
      0x1A,
      0x0A,
      0,
    ]);
    expect(AvatarUpload.fromBytes(png)?.contentType, 'image/png');
    expect(AvatarUpload.fromBytes(Uint8List.fromList([1, 2, 3])), isNull);
    expect(
      AvatarUpload.fromBytes(Uint8List(AvatarUpload.maxBytes + 1)),
      isNull,
    );
  });
}
