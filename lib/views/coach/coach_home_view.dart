import 'package:flutter/material.dart';

import '../../app/app_scope.dart';
import '../../core/localization/app_localizations.dart';
import '../../models/athlete/athlete_profile.dart';
import '../../widgets/app_card.dart';
import '../../widgets/retry_state.dart';
import '../../widgets/role_home_scaffold.dart';

/// Home de COACH: lista de deportistas a cargo (`GET /athletes/coached`).
/// El backend no expone el nombre del usuario en `AthleteProfileRead`, así
/// que la tarjeta identifica al deportista por su user_id y deporte.
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
      AppScope.of(context).athleteApi.listCoached();

  @override
  Widget build(BuildContext context) => RoleHomeScaffold(
    titleKey: 'coachHomeTitle',
    body: FutureBuilder<List<AthleteProfile>>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return RetryState(
            messageKey: 'errorGeneric',
            onRetry: () => setState(() => _future = _load()),
          );
        }
        final athletes = snapshot.data!;
        if (athletes.isEmpty) {
          return Center(child: Text(context.tr('noCoachedAthletes')));
        }
        return ListView(
          padding: const EdgeInsets.all(20),
          children: athletes
              .map((athlete) => _CoachedAthleteTile(athlete: athlete))
              .toList(),
        );
      },
    ),
  );
}

class _CoachedAthleteTile extends StatelessWidget {
  const _CoachedAthleteTile({required this.athlete});

  final AthleteProfile athlete;

  @override
  Widget build(BuildContext context) => AppCard(
    child: ListTile(
      contentPadding: EdgeInsets.zero,
      leading: const Icon(Icons.person_outline),
      title: Text(athlete.sport),
      subtitle: Text('${context.tr('athlete')} #${athlete.userId}'),
    ),
  );
}
