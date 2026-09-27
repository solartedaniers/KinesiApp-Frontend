import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/app_scope.dart';
import '../../controllers/loadable_controller.dart';
import '../../core/error/error_message_resolver.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/network/api_exception.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/athlete/athlete_profile.dart';
import '../../widgets/app_card.dart';
import '../../widgets/controller_scope.dart';
import '../../widgets/loadable_view.dart';
import '../../widgets/user_avatar.dart';
import '../../widgets/welcome_header.dart';

/// Pestaña Inicio del coach: tarjetas de los deportistas a cargo. Al tocar una
/// se abre su ficha (CoachAthleteDetailView); los gestionados se eliminan aquí
/// y se crean con el "+" central del shell.
class CoachHomeView extends StatelessWidget {
  const CoachHomeView({super.key});

  Future<void> _openDetail(BuildContext context, AthleteProfile athlete) async {
    final controller = ControllerScope.read<CoachAthletesController>(context);
    await context.push(AppRoutes.coachAthleteDetail, extra: athlete);
    // La ficha o su foto pudieron cambiar en el detalle: se refresca al volver
    controller.load();
  }

  Future<void> _delete(BuildContext context, AthleteProfile athlete) async {
    final controller = ControllerScope.read<CoachAthletesController>(context);
    final api = AppScope.read(context).managedAthleteApi;
    final messenger = ScaffoldMessenger.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(context.tr('deleteManagedAthleteTitle')),
        content: Text(athlete.displayName),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: Text(context.tr('cancel')),
          ),
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: Text(context.tr('delete')),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await api.delete(athlete.id);
      controller.load();
    } on ApiException catch (e) {
      if (!context.mounted) return;
      messenger.showSnackBar(
        SnackBar(
          content: Text(context.tr(ErrorMessageResolver.keyFor(e.code))),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return LoadableView(
      controller: ControllerScope.of<CoachAthletesController>(context),
      builder: (context, athletes) => ListView(
        // Espacio inferior para que el "+" central no tape la última tarjeta
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg,
          AppSpacing.lg,
          AppSpacing.lg,
          AppSpacing.xxl * 2,
        ),
        children: [
          WelcomeHeader(hintKey: 'coachHomeHint'),
          const SizedBox(height: AppSpacing.lg),
          if (athletes.isEmpty)
            AppCard(child: Text(context.tr('noCoachedAthletes'))),
          for (final athlete in athletes)
            _CoachedAthleteTile(
              athlete: athlete,
              onOpen: () => _openDetail(context, athlete),
              onDelete: athlete.isManaged
                  ? () => _delete(context, athlete)
                  : null,
            ),
        ],
      ),
    );
  }
}

class _CoachedAthleteTile extends StatelessWidget {
  const _CoachedAthleteTile({
    required this.athlete,
    required this.onOpen,
    required this.onDelete,
  });

  final AthleteProfile athlete;
  final VoidCallback onOpen;
  final VoidCallback? onDelete;

  @override
  Widget build(BuildContext context) => AppCard(
    onTap: onOpen,
    child: ListTile(
      contentPadding: EdgeInsets.zero,
      leading: UserAvatar(
        name: athlete.displayName,
        bytes: athlete.avatarBytes,
      ),
      title: Text(athlete.displayName),
      subtitle: Text(
        '${context.tr(athlete.gender.labelKey)} · ${athlete.heightCm.toStringAsFixed(0)} cm · '
        '${athlete.weightKg.toStringAsFixed(1)} kg',
      ),
      trailing: onDelete == null
          ? const Icon(Icons.verified_user_outlined)
          : IconButton(
              onPressed: onDelete,
              icon: const Icon(Icons.delete_outline),
              tooltip: context.tr('delete'),
            ),
    ),
  );
}
