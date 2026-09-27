import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../controllers/loadable_controller.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/theme/app_spacing.dart';
import '../../widgets/controller_scope.dart';
import '../../widgets/loadable_view.dart';
import '../../widgets/stat_grid.dart';
import '../athlete/analysis_statistics_panel.dart';

/// Pestaña Estadísticas del coach: tamaño de la plantilla y métricas de las
/// grabaciones de todo el equipo.
class CoachStatsView extends StatelessWidget {
  const CoachStatsView({super.key});

  @override
  Widget build(BuildContext context) {
    final athletes = ControllerScope.of<CoachAthletesController>(context);
    return LoadableView(
      controller: ControllerScope.of<JumpAnalysesController>(context),
      builder: (context, analyses) => ListView(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg,
          AppSpacing.lg,
          AppSpacing.lg,
          AppSpacing.xxl * 2,
        ),
        children: [
          AnalysisStatisticsPanel(
            analyses: analyses,
            onRecordingsTap: () => context.go(AppRoutes.coachTeamAnalyses),
            leadingItems: [
              StatItem(
                labelKey: 'statsAthletes',
                value: athletes.hasData ? '${athletes.data.length}' : '—',
                icon: Icons.groups_outlined,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
