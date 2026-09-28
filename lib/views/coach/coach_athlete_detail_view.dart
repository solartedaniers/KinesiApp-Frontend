import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/app_scope.dart';
import '../../controllers/loadable_controller.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/athlete/athlete_profile.dart';
import '../../widgets/avatar_editor.dart';
import '../../widgets/loadable_view.dart';
import '../../widgets/primary_button.dart';
import '../../widgets/user_avatar.dart';
import '../athlete/athlete_profile_form.dart';
import '../athlete/athlete_profile_summary.dart';
import '../athlete/jump_analysis_list.dart';

/// Ficha de un deportista a cargo del coach: foto, datos físicos y análisis de
/// salto. Solo los gestionados (sin cuenta propia) se editan, cambian de foto y
/// se analizan desde aquí; los que tienen cuenta son de solo lectura.
class CoachAthleteDetailView extends StatefulWidget {
  const CoachAthleteDetailView({super.key, required this.athlete});

  final AthleteProfile athlete;

  @override
  State<CoachAthleteDetailView> createState() => _CoachAthleteDetailViewState();
}

class _CoachAthleteDetailViewState extends State<CoachAthleteDetailView> {
  late AthleteProfile _athlete = widget.athlete;
  late final JumpAnalysesController _analyses;

  @override
  void initState() {
    super.initState();
    final api = AppScope.read(context).jumpAnalysisApi;
    _analyses = JumpAnalysesController(
      () => api.listByAthlete(widget.athlete.id),
    )..load();
  }

  @override
  void dispose() {
    _analyses.dispose();
    super.dispose();
  }

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

  Future<void> _applyAvatar(Future<AthleteProfile> request) async {
    final updated = await request;
    if (mounted) setState(() => _athlete = updated);
  }

  @override
  Widget build(BuildContext context) {
    final api = AppScope.of(context).managedAthleteApi;
    return Scaffold(
      appBar: AppBar(title: Text(_athlete.displayName)),
      body: SafeArea(
        child: LoadableView(
          controller: _analyses,
          builder: (context, analyses) => ListView(
            padding: const EdgeInsets.all(AppSpacing.lg),
            children: [
              Center(
                child: _athlete.isManaged
                    ? AvatarEditor(
                        name: _athlete.displayName,
                        bytes: _athlete.avatarBytes,
                        onUpload: (avatar) =>
                            _applyAvatar(api.uploadAvatar(_athlete.id, avatar)),
                        onRemove: () =>
                            _applyAvatar(api.deleteAvatar(_athlete.id)),
                      )
                    : UserAvatar(
                        name: _athlete.displayName,
                        bytes: _athlete.avatarBytes,
                        radius: 44,
                      ),
              ),
              const SizedBox(height: AppSpacing.lg),
              AthleteProfileSummary(
                profile: _athlete,
                onEdit: _athlete.isManaged ? _edit : null,
              ),
              if (_athlete.isManaged)
                PrimaryButton(
                  label: context.tr('startJumpAnalysis'),
                  icon: Icons.videocam,
                  onPressed: () =>
                      context.go(AppRoutes.videoConsent, extra: _athlete.id),
                ),
              const SizedBox(height: AppSpacing.lg),
              JumpAnalysisList(analyses: analyses, onChanged: _analyses.load),
            ],
          ),
        ),
      ),
    );
  }
}
