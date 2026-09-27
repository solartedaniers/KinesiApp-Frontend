import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/app_scope.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/navigation/app_routes.dart';
import '../../models/athlete/athlete_profile.dart';
import '../../widgets/primary_button.dart';
import '../athlete/athlete_profile_form.dart';
import '../athlete/athlete_profile_summary.dart';
import '../athlete/jump_analysis_list.dart';

/// Ficha de un deportista a cargo del coach: datos físicos y análisis de salto.
/// Solo los gestionados (sin cuenta propia) se editan y se analizan desde aquí;
/// los que tienen cuenta son de solo lectura, su ficha es del deportista.
class CoachAthleteDetailView extends StatefulWidget {
  const CoachAthleteDetailView({super.key, required this.athlete});

  final AthleteProfile athlete;

  @override
  State<CoachAthleteDetailView> createState() => _CoachAthleteDetailViewState();
}

class _CoachAthleteDetailViewState extends State<CoachAthleteDetailView> {
  late AthleteProfile _athlete = widget.athlete;

  Future<void> _edit() async {
    final api = AppScope.read(context).managedAthleteApi;
    AthleteProfile? updated;
    await AthleteProfileForm.openAsPage(
      context,
      titleKey: 'editManagedAthlete',
      actionKey: 'saveChanges',
      askFullName: true,
      initialProfile: _athlete,
      onSubmit: (data) async => updated = await api.update(_athlete.id, data),
    );
    if (updated != null && mounted) setState(() => _athlete = updated!);
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text(_athlete.displayName)),
    body: SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          AthleteProfileSummary(
            profile: _athlete,
            onEdit: _athlete.isManaged ? _edit : null,
          ),
          if (_athlete.isManaged) ...[
            const SizedBox(height: 20),
            PrimaryButton(
              label: context.tr('startJumpAnalysis'),
              icon: Icons.videocam,
              onPressed: () =>
                  context.go(AppRoutes.videoConsent, extra: _athlete.id),
            ),
          ],
          const SizedBox(height: 20),
          JumpAnalysisList(athleteId: _athlete.id),
        ],
      ),
    ),
  );
}
