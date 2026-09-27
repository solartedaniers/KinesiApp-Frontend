import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/app_scope.dart';
import '../../controllers/loadable_controller.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/jump_analysis/analysis_statistics.dart';
import '../../widgets/controller_scope.dart';
import '../../widgets/loadable_view.dart';
import '../../widgets/primary_button.dart';
import '../../widgets/stat_grid.dart';
import '../../widgets/welcome_header.dart';
import 'jump_analysis_list.dart';

/// Pestaña Inicio del deportista: saludo, acceso directo a grabar un salto,
/// métricas rápidas y sus últimas grabaciones.
class AthleteDashboardView extends StatelessWidget {
  const AthleteDashboardView({super.key});

  static const int _recentCount = 3;

  @override
  Widget build(BuildContext context) {
    final profile = ControllerScope.of<AthleteProfileController>(context).data!;
    final user = AppScope.of(context).sessionController.currentUser!;
    return LoadableView(
      controller: ControllerScope.of<JumpAnalysesController>(context),
      builder: (context, analyses) => ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          WelcomeHeader(
            name: user.fullName,
            avatarBytes: profile.avatarBytes ?? user.avatarBytes,
            hintKey: 'athleteHomeHint',
          ),
          const SizedBox(height: AppSpacing.lg),
          PrimaryButton(
            label: context.tr('startJumpAnalysis'),
            icon: Icons.videocam,
            onPressed: () =>
                context.go(AppRoutes.videoConsent, extra: profile.id),
          ),
          const SizedBox(height: AppSpacing.lg),
          // Resumen corto; el detalle completo está en la pestaña Estadísticas
          StatGrid(
            items: [
              StatItem(
                labelKey: 'statsRecordings',
                value: '${analyses.length}',
                icon: Icons.videocam_outlined,
              ),
              StatItem(
                labelKey: 'statsAverageRisk',
                value:
                    AnalysisStatistics(
                      analyses,
                    ).averageRisk?.toStringAsFixed(2) ??
                    '—',
                icon: Icons.speed,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          JumpAnalysisList(analyses: analyses.take(_recentCount).toList()),
          if (analyses.length > _recentCount)
            TextButton(
              onPressed: () => context.go(AppRoutes.athleteAnalyses),
              child: Text(context.tr('seeAllAnalyses')),
            ),
        ],
      ),
    );
  }
}
