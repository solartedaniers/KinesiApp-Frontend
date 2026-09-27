import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../controllers/loadable_controller.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/theme/app_spacing.dart';
import '../../widgets/controller_scope.dart';
import '../../widgets/loadable_view.dart';
import '../../widgets/primary_button.dart';
import 'jump_analysis_list.dart';

/// Pestaña Grabaciones del deportista: grabar un salto nuevo y el historial
/// completo de análisis.
class AthleteAnalysesView extends StatelessWidget {
  const AthleteAnalysesView({super.key});

  @override
  Widget build(BuildContext context) {
    final profile = ControllerScope.of<AthleteProfileController>(context).data!;
    return LoadableView(
      controller: ControllerScope.of<JumpAnalysesController>(context),
      builder: (context, analyses) => ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          PrimaryButton(
            label: context.tr('startJumpAnalysis'),
            icon: Icons.videocam,
            onPressed: () =>
                context.go(AppRoutes.videoConsent, extra: profile.id),
          ),
          const SizedBox(height: AppSpacing.lg),
          JumpAnalysisList(analyses: analyses, titleKey: 'navAnalyses'),
        ],
      ),
    );
  }
}
