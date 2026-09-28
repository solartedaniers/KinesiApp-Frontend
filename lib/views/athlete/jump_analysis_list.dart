import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/localization/app_localizations.dart';
import '../../core/navigation/app_routes.dart';
import '../../models/jump_analysis/analysis_statistics.dart';
import '../../models/jump_analysis/jump_analysis_status.dart';
import '../../models/jump_analysis/jump_analysis_summary.dart';
import '../../widgets/app_card.dart';

/// Lista de análisis de salto ya cargados por quien la usa. Sin datos falsos:
/// si no hay ninguno, se muestra el estado vacío real. Con [athleteNames]
/// (vista de equipo del coach) cada fila indica de qué deportista es.
class JumpAnalysisList extends StatelessWidget {
  const JumpAnalysisList({
    super.key,
    required this.analyses,
    this.titleKey = 'recentAnalyses',
    this.emptyKey = 'noAnalysesYet',
    this.athleteNames = const {},
    this.onChanged,
  });

  final List<JumpAnalysisSummary> analyses;
  final String titleKey;
  final String emptyKey;
  final Map<int, String> athleteNames;

  /// Se llama cuando una grabación cambió en su detalle (p. ej. se borró), para
  /// que quien tiene los datos los recargue.
  final VoidCallback? onChanged;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(context.tr(titleKey), style: Theme.of(context).textTheme.titleLarge),
      const SizedBox(height: 8),
      if (analyses.isEmpty)
        AppCard(child: Text(context.tr(emptyKey)))
      else
        for (final analysis in analyses)
          _JumpAnalysisTile(
            analysis: analysis,
            athleteName: athleteNames[analysis.athleteId],
            onChanged: onChanged,
          ),
    ],
  );
}

class _JumpAnalysisTile extends StatelessWidget {
  const _JumpAnalysisTile({
    required this.analysis,
    this.athleteName,
    this.onChanged,
  });

  final JumpAnalysisSummary analysis;
  final String? athleteName;
  final VoidCallback? onChanged;

  Future<void> _open(BuildContext context) async {
    final changed = await context.push<bool>(
      AppRoutes.analysisDetailFor(analysis.id),
    );
    if (changed ?? false) onChanged?.call();
  }

  String _statusKey(JumpAnalysisStatus status) => switch (status) {
    JumpAnalysisStatus.pending => 'analysisStatusPending',
    JumpAnalysisStatus.processed => 'analysisStatusProcessed',
    JumpAnalysisStatus.failed => 'analysisStatusFailed',
  };

  @override
  Widget build(BuildContext context) {
    final date = analysis.recordedAt.toIso8601String().split('T').first;
    final risk = analysis.riskScore;
    final scheme = Theme.of(context).colorScheme;
    return AppCard(
      onTap: () => _open(context),
      child: ListTile(
        contentPadding: EdgeInsets.zero,
        leading: const Icon(Icons.directions_run),
        // Sin trailing de navegación: el chip de riesgo ya ocupa ese lugar
        title: Text(athleteName ?? date),
        subtitle: Text(
          athleteName == null
              ? context.tr(_statusKey(analysis.status))
              : '$date · ${context.tr(_statusKey(analysis.status))}',
        ),
        trailing: risk == null
            ? null
            : Chip(
                label: Text(risk.toStringAsFixed(2)),
                backgroundColor: risk >= AnalysisStatistics.highRiskThreshold
                    ? scheme.errorContainer
                    : scheme.primaryContainer,
              ),
      ),
    );
  }
}
