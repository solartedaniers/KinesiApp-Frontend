import 'package:flutter/material.dart';

import '../../controllers/loadable_controller.dart';
import '../../core/theme/app_spacing.dart';
import '../../widgets/controller_scope.dart';
import '../../widgets/loadable_view.dart';
import '../athlete/jump_analysis_list.dart';

/// Pestaña Equipo del coach: todas las grabaciones de sus deportistas
/// (`GET /jump-analyses/team`), cada una con el nombre del deportista.
class CoachTeamAnalysesView extends StatelessWidget {
  const CoachTeamAnalysesView({super.key});

  @override
  Widget build(BuildContext context) {
    final athletes = ControllerScope.of<CoachAthletesController>(context);
    final names = {
      if (athletes.hasData)
        for (final athlete in athletes.data) athlete.id: athlete.displayName,
    };
    final analysesController = ControllerScope.of<JumpAnalysesController>(
      context,
    );
    return LoadableView(
      controller: analysesController,
      builder: (context, analyses) => ListView(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg,
          AppSpacing.lg,
          AppSpacing.lg,
          AppSpacing.xxl * 2,
        ),
        children: [
          JumpAnalysisList(
            analyses: analyses,
            titleKey: 'navTeamAnalyses',
            emptyKey: 'teamAnalysesEmpty',
            athleteNames: names,
            onChanged: analysesController.load,
          ),
        ],
      ),
    );
  }
}
