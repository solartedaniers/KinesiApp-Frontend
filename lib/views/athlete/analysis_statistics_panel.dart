import 'package:flutter/material.dart';

import '../../models/jump_analysis/analysis_statistics.dart';
import '../../models/jump_analysis/jump_analysis_summary.dart';
import '../../widgets/stat_grid.dart';

/// Métricas de una lista de análisis; la usan las estadísticas del deportista
/// (sus grabaciones) y las del coach (todo su equipo).
class AnalysisStatisticsPanel extends StatelessWidget {
  const AnalysisStatisticsPanel({
    super.key,
    required this.analyses,
    this.leadingItems = const [],
    this.onRecordingsTap,
  });

  final List<JumpAnalysisSummary> analyses;

  /// Métricas propias de quien lo usa, antes de las de análisis.
  final List<StatItem> leadingItems;

  /// Abre la lista de grabaciones de quien lo usa.
  final VoidCallback? onRecordingsTap;

  static String _score(double? value) => value?.toStringAsFixed(2) ?? '—';

  @override
  Widget build(BuildContext context) {
    final stats = AnalysisStatistics(analyses);
    final last = stats.lastRecordedAt;
    return StatGrid(
      items: [
        ...leadingItems,
        StatItem(
          labelKey: 'statsRecordings',
          value: '${stats.total}',
          icon: Icons.videocam_outlined,
          onTap: onRecordingsTap,
        ),
        StatItem(
          labelKey: 'analysisStatusProcessed',
          value: '${stats.processed}',
          icon: Icons.check_circle_outline,
        ),
        StatItem(
          labelKey: 'analysisStatusPending',
          value: '${stats.pending}',
          icon: Icons.hourglass_top,
        ),
        StatItem(
          labelKey: 'analysisStatusFailed',
          value: '${stats.failed}',
          icon: Icons.error_outline,
        ),
        StatItem(
          labelKey: 'statsAverageRisk',
          value: _score(stats.averageRisk),
          icon: Icons.speed,
        ),
        StatItem(
          labelKey: 'statsHighestRisk',
          value: _score(stats.highestRisk),
          icon: Icons.trending_up,
        ),
        StatItem(
          labelKey: 'statsHighRiskCount',
          value: '${stats.highRiskCount}',
          icon: Icons.warning_amber_rounded,
        ),
        StatItem(
          labelKey: 'statsLastRecording',
          value: last == null
              ? '—'
              : MaterialLocalizations.of(context).formatShortDate(last),
          icon: Icons.event,
        ),
      ],
    );
  }
}
