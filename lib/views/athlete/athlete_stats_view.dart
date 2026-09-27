import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../controllers/loadable_controller.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/theme/app_spacing.dart';
import '../../widgets/app_card.dart';
import '../../widgets/controller_scope.dart';
import '../../widgets/loadable_view.dart';
import 'analysis_statistics_panel.dart';

/// Pestaña Estadísticas del deportista: métricas de todo su historial.
class AthleteStatsView extends StatelessWidget {
  const AthleteStatsView({super.key});

  @override
  Widget build(BuildContext context) => LoadableView(
    controller: ControllerScope.of<JumpAnalysesController>(context),
    builder: (context, analyses) => ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        if (analyses.isEmpty) AppCard(child: Text(context.tr('statsEmpty'))),
        AnalysisStatisticsPanel(
          analyses: analyses,
          onRecordingsTap: () => context.go(AppRoutes.athleteAnalyses),
        ),
      ],
    ),
  );
}
