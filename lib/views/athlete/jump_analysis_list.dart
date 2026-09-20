import 'package:flutter/material.dart';

import '../../app/app_scope.dart';
import '../../core/localization/app_localizations.dart';
import '../../models/jump_analysis/jump_analysis_status.dart';
import '../../models/jump_analysis/jump_analysis_summary.dart';
import '../../widgets/app_card.dart';
import '../../widgets/retry_state.dart';

/// Lista de análisis de salto del deportista (`GET /jump-analyses/by-athlete/{id}`).
/// Sin datos falsos: si no hay ninguno, se muestra el estado vacío real.
class JumpAnalysisList extends StatefulWidget {
  const JumpAnalysisList({super.key, required this.athleteId});

  final int athleteId;

  @override
  State<JumpAnalysisList> createState() => _JumpAnalysisListState();
}

class _JumpAnalysisListState extends State<JumpAnalysisList> {
  late Future<List<JumpAnalysisSummary>> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List<JumpAnalysisSummary>> _load() =>
      AppScope.of(context).jumpAnalysisApi.listByAthlete(widget.athleteId);

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        context.tr('recentAnalyses'),
        style: Theme.of(
          context,
        ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
      ),
      const SizedBox(height: 8),
      FutureBuilder<List<JumpAnalysisSummary>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return RetryState(
              messageKey: 'errorGeneric',
              onRetry: () => setState(() => _future = _load()),
            );
          }
          final analyses = snapshot.data!;
          if (analyses.isEmpty) {
            return AppCard(child: Text(context.tr('noAnalysesYet')));
          }
          return Column(
            children: analyses
                .map((analysis) => _JumpAnalysisTile(analysis: analysis))
                .toList(),
          );
        },
      ),
    ],
  );
}

class _JumpAnalysisTile extends StatelessWidget {
  const _JumpAnalysisTile({required this.analysis});

  final JumpAnalysisSummary analysis;

  String _statusKey(JumpAnalysisStatus status) => switch (status) {
    JumpAnalysisStatus.pending => 'analysisStatusPending',
    JumpAnalysisStatus.processed => 'analysisStatusProcessed',
    JumpAnalysisStatus.failed => 'analysisStatusFailed',
  };

  @override
  Widget build(BuildContext context) => AppCard(
    child: ListTile(
      contentPadding: EdgeInsets.zero,
      leading: const Icon(Icons.directions_run),
      title: Text(analysis.recordedAt.toIso8601String().split('T').first),
      subtitle: Text(context.tr(_statusKey(analysis.status))),
      trailing: analysis.riskScore == null
          ? null
          : Text(analysis.riskScore!.toStringAsFixed(2)),
    ),
  );
}
