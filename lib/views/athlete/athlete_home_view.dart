import 'package:flutter/material.dart';

import '../../app/app_scope.dart';
import '../../core/network/api_exception.dart';
import '../../models/athlete/athlete_profile.dart';
import '../../widgets/retry_state.dart';
import '../../widgets/role_home_scaffold.dart';
import 'athlete_profile_setup_view.dart';
import 'athlete_profile_summary.dart';
import 'jump_analysis_list.dart';

/// Home de ATHLETE: si `GET /athletes/me` da 404 muestra el alta de perfil en
/// vez del contenido normal (decisión de diseño: sin ruta propia de go_router
/// para esto, ver `app_routes.dart`); cualquier otro error es un estado de
/// reintento, nunca se confunde con "no tiene perfil".
class AthleteHomeView extends StatefulWidget {
  const AthleteHomeView({super.key});

  @override
  State<AthleteHomeView> createState() => _AthleteHomeViewState();
}

class _AthleteHomeViewState extends State<AthleteHomeView> {
  late Future<AthleteProfile?> _profileFuture;

  @override
  void initState() {
    super.initState();
    _profileFuture = _loadProfile();
  }

  Future<AthleteProfile?> _loadProfile() async {
    try {
      return await AppScope.of(context).athleteApi.getMine();
    } on ApiException catch (e) {
      if (e.statusCode == 404) return null;
      rethrow;
    }
  }

  void _reload() => setState(() => _profileFuture = _loadProfile());

  @override
  Widget build(BuildContext context) => RoleHomeScaffold(
    titleKey: 'athleteHomeTitle',
    body: FutureBuilder<AthleteProfile?>(
      future: _profileFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return RetryState(messageKey: 'errorGeneric', onRetry: _reload);
        }
        final profile = snapshot.data;
        if (profile == null) {
          return AthleteProfileSetupView(onCreated: _reload);
        }
        return ListView(
          padding: const EdgeInsets.all(20),
          children: [
            AthleteProfileSummary(profile: profile),
            const SizedBox(height: 20),
            JumpAnalysisList(athleteId: profile.id),
          ],
        );
      },
    ),
  );
}
