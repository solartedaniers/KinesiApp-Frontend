import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/app_scope.dart';
import '../../controllers/loadable_controller.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/navigation/role_home_resolver.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/jump_analysis/jump_analysis_status.dart';
import '../../models/jump_analysis/jump_analysis_summary.dart';
import '../../widgets/analysis_video_player.dart';
import '../../widgets/app_card.dart';
import '../../widgets/loadable_view.dart';
import '../../widgets/role_home_button.dart';
import 'delete_analysis_button.dart';

typedef _AnalysisDetail = ({JumpAnalysisSummary analysis, Uri videoUrl});

/// Detalle de una grabación: reproduce el video y muestra estado y resultado
/// tal como los guarda el backend. Se llega desde cualquier lista de análisis.
class AnalysisDetailView extends StatefulWidget {
  const AnalysisDetailView({super.key, required this.analysisId});

  final int analysisId;

  @override
  State<AnalysisDetailView> createState() => _AnalysisDetailViewState();
}

class _AnalysisDetailViewState extends State<AnalysisDetailView> {
  late final LoadableController<_AnalysisDetail> _detail;

  @override
  void initState() {
    super.initState();
    final api = AppScope.read(context).jumpAnalysisApi;
    _detail = LoadableController(
      () async => (
        analysis: await api.get(widget.analysisId),
        videoUrl: await api.videoUrl(widget.analysisId),
      ),
    )..load();
  }

  @override
  void dispose() {
    _detail.dispose();
    super.dispose();
  }

  /// Vuelve a la lista con `true` para que la recargue. Si se llegó sin pila
  /// (al terminar el procesamiento de una grabación nueva), va a la home del rol.
  void _leaveAfterDelete() {
    if (context.canPop()) {
      context.pop(true);
    } else {
      final role = AppScope.read(context).sessionController.currentUser!.role;
      context.go(RoleHomeResolver.resolve(role));
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text(context.tr('analysisDetailTitle')),
      actions: [
        DeleteAnalysisButton(
          delete: () =>
              AppScope.read(context).jumpAnalysisApi.delete(widget.analysisId),
          onDeleted: _leaveAfterDelete,
        ),
        const RoleHomeButton(),
      ],
    ),
    body: SafeArea(
      child: LoadableView(
        controller: _detail,
        builder: (context, detail) => ListView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
            AnalysisVideoPlayer(url: detail.videoUrl),
            const SizedBox(height: AppSpacing.lg),
            _AnalysisResultCard(analysis: detail.analysis),
            if (detail.analysis.status == JumpAnalysisStatus.processed)
              TextButton.icon(
                onPressed: () => context.push(
                  AppRoutes.analysisChat,
                  extra: detail.analysis.id,
                ),
                icon: const Icon(Icons.chat_bubble_outline),
                label: Text(context.tr('analysisOpenChat')),
              ),
          ],
        ),
      ),
    ),
  );
}

/// Estado, tipo de movimiento, fecha y score tal como vienen del backend.
class _AnalysisResultCard extends StatelessWidget {
  const _AnalysisResultCard({required this.analysis});

  final JumpAnalysisSummary analysis;

  static String _statusKey(JumpAnalysisStatus status) => switch (status) {
    JumpAnalysisStatus.pending => 'analysisStatusPending',
    JumpAnalysisStatus.processed => 'analysisStatusProcessed',
    JumpAnalysisStatus.failed => 'analysisStatusFailed',
  };

  @override
  Widget build(BuildContext context) {
    final risk = analysis.riskScore;
    Widget row(String labelKey, String value) => ListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(context.tr(labelKey)),
      trailing: Text(value, style: Theme.of(context).textTheme.titleMedium),
    );
    return AppCard(
      child: Column(
        children: [
          row(
            'analysisMovementType',
            context.tr(analysis.movementType.labelKey),
          ),
          row('analysisStatusLabel', context.tr(_statusKey(analysis.status))),
          row(
            'analysisRecordedAt',
            MaterialLocalizations.of(
              context,
            ).formatShortDate(analysis.recordedAt),
          ),
          row('analysisRiskScore', risk?.toStringAsFixed(2) ?? '—'),
        ],
      ),
    );
  }
}
