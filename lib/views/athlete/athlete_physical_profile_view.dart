import 'package:flutter/material.dart';

import '../../app/app_scope.dart';
import '../../controllers/loadable_controller.dart';
import '../../core/localization/app_localizations.dart';
import '../../widgets/controller_scope.dart';
import '../profile/account_settings_view.dart';
import 'athlete_profile_form.dart';
import 'athlete_profile_summary.dart';

/// Pestaña Perfil del deportista: su cuenta (foto, nombre, contraseña) más la
/// ficha física editable.
class AthletePhysicalProfileView extends StatelessWidget {
  const AthletePhysicalProfileView({super.key});

  Future<void> _edit(BuildContext context) async {
    final controller = ControllerScope.read<AthleteProfileController>(context);
    final athleteApi = AppScope.read(context).athleteApi;
    await AthleteProfileForm.openAsPage(
      context,
      titleKey: 'editAthleteProfile',
      actionKey: 'saveChanges',
      initialProfile: controller.data,
      onSubmit: (data) async =>
          controller.replace(await athleteApi.updateMine(data)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final profile = ControllerScope.of<AthleteProfileController>(context).data!;
    return AccountSettingsView(
      extraSections: [
        Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Text(
            context.tr('physicalDataSection'),
            style: Theme.of(context).textTheme.titleMedium,
          ),
        ),
        AthleteProfileSummary(profile: profile, onEdit: () => _edit(context)),
      ],
    );
  }
}
