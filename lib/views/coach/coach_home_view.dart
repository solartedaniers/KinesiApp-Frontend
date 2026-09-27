import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/app_scope.dart';
import '../../core/error/error_message_resolver.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/network/api_exception.dart';
import '../../models/athlete/athlete_profile.dart';
import '../../widgets/app_card.dart';
import '../../widgets/retry_state.dart';
import '../../widgets/role_home_scaffold.dart';
import '../athlete/athlete_profile_form.dart';

/// Home de COACH: tarjetas de los deportistas a cargo (`GET /coach/athletes`).
/// Los gestionados (sin cuenta propia) se crean y eliminan desde aquí; al tocar
/// cualquier tarjeta se abre su ficha con los análisis (CoachAthleteDetailView).
class CoachHomeView extends StatefulWidget {
  const CoachHomeView({super.key});

  @override
  State<CoachHomeView> createState() => _CoachHomeViewState();
}

class _CoachHomeViewState extends State<CoachHomeView> {
  late Future<List<AthleteProfile>> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List<AthleteProfile>> _load() =>
      AppScope.read(context).managedAthleteApi.list();

  void _reload() => setState(() => _future = _load());

  Future<void> _create() async {
    final api = AppScope.read(context).managedAthleteApi;
    final saved = await AthleteProfileForm.openAsPage(
      context,
      titleKey: 'newManagedAthlete',
      actionKey: 'saveChanges',
      askFullName: true,
      onSubmit: api.create,
    );
    if (saved) _reload();
  }

  Future<void> _openDetail(AthleteProfile athlete) async {
    await context.push(AppRoutes.coachAthleteDetail, extra: athlete);
    // La ficha pudo editarse en el detalle: se refresca al volver
    if (mounted) _reload();
  }

  Future<void> _delete(AthleteProfile athlete) async {
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
      _reload();
    } on ApiException catch (e) {
      if (!mounted) return;
      messenger.showSnackBar(
        SnackBar(
          content: Text(context.tr(ErrorMessageResolver.keyFor(e.code))),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) => RoleHomeScaffold(
    titleKey: 'coachHomeTitle',
    floatingActionButton: FloatingActionButton.extended(
      onPressed: _create,
      icon: const Icon(Icons.person_add_alt_1),
      label: Text(context.tr('newManagedAthlete')),
    ),
    body: FutureBuilder<List<AthleteProfile>>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return RetryState(messageKey: 'errorGeneric', onRetry: _reload);
        }
        final athletes = snapshot.data!;
        if (athletes.isEmpty) {
          return Center(child: Text(context.tr('noCoachedAthletes')));
        }
        return ListView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 96),
          children: athletes
              .map(
                (athlete) => _CoachedAthleteTile(
                  athlete: athlete,
                  onOpen: () => _openDetail(athlete),
                  onDelete: athlete.isManaged ? () => _delete(athlete) : null,
                ),
              )
              .toList(),
        );
      },
    ),
  );
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
    child: ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Icon(
        athlete.isManaged ? Icons.person_outline : Icons.verified_user_outlined,
      ),
      title: Text(athlete.displayName),
      subtitle: Text(
        '${context.tr(athlete.gender.labelKey)} · ${athlete.heightCm.toStringAsFixed(0)} cm · '
        '${athlete.weightKg.toStringAsFixed(1)} kg',
      ),
      onTap: onOpen,
      trailing: onDelete == null
          ? null
          : IconButton(
              onPressed: onDelete,
              icon: const Icon(Icons.delete_outline),
              tooltip: context.tr('delete'),
            ),
    ),
  );
}
