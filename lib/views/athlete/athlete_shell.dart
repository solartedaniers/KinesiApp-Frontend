import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/app_scope.dart';
import '../../controllers/loadable_controller.dart';
import '../../core/network/api_exception.dart';
import '../../widgets/controller_scope.dart';
import '../../widgets/retry_state.dart';
import '../../widgets/role_home_scaffold.dart';
import '../../widgets/role_shell_scaffold.dart';
import 'athlete_profile_form.dart';

/// Shell de ATHLETE: carga una vez la ficha y sus análisis y los comparte con
/// las 4 pestañas. Si `GET /athletes/me` da 404 no hay pestañas: se muestra el
/// alta obligatoria de ficha física (ningún otro error se confunde con eso).
class AthleteShell extends StatefulWidget {
  const AthleteShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  static const List<ShellDestination> destinations = [
    ShellDestination(
      labelKey: 'navHome',
      icon: Icons.home_outlined,
      selectedIcon: Icons.home,
    ),
    ShellDestination(
      labelKey: 'navPhysicalProfile',
      icon: Icons.accessibility_new_outlined,
      selectedIcon: Icons.accessibility_new,
    ),
    ShellDestination(
      labelKey: 'navAnalyses',
      icon: Icons.videocam_outlined,
      selectedIcon: Icons.videocam,
    ),
    ShellDestination(
      labelKey: 'navStats',
      icon: Icons.insights_outlined,
      selectedIcon: Icons.insights,
    ),
  ];

  @override
  State<AthleteShell> createState() => _AthleteShellState();
}

class _AthleteShellState extends State<AthleteShell> {
  late final AthleteProfileController _profile;
  late final JumpAnalysesController _analyses;

  @override
  void initState() {
    super.initState();
    final scope = AppScope.read(context);
    _profile = AthleteProfileController(() async {
      try {
        return await scope.athleteApi.getMine();
      } on ApiException catch (e) {
        if (e.statusCode == 404) return null;
        rethrow;
      }
    });
    _analyses = JumpAnalysesController(
      () => scope.jumpAnalysisApi.listByAthlete(_profile.data!.id),
    );
    _loadAll();
  }

  Future<void> _loadAll() async {
    await _profile.load();
    if (_profile.hasData && _profile.data != null) await _analyses.load();
  }

  @override
  void dispose() {
    _profile.dispose();
    _analyses.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => ListenableBuilder(
    listenable: _profile,
    builder: (context, _) {
      if (!_profile.hasData) {
        return RoleHomeScaffold(
          titleKey: 'athleteHomeTitle',
          body: _profile.hasError
              ? RetryState(messageKey: 'errorGeneric', onRetry: _loadAll)
              : const Center(child: CircularProgressIndicator()),
        );
      }
      // Alta obligatoria: sin ficha física no se accede al contenido de la app
      if (_profile.data == null) {
        return RoleHomeScaffold(
          titleKey: 'athleteProfileSetupTitle',
          body: AthleteProfileForm(
            titleKey: 'athleteProfileSetupTitle',
            hintKey: 'athleteProfileSetupHint',
            actionKey: 'athleteProfileSetupAction',
            onSubmit: (data) async {
              _profile.replace(
                await AppScope.read(context).athleteApi.createMine(data),
              );
              await _analyses.load();
            },
          ),
        );
      }
      return ControllerScope<AthleteProfileController>(
        controller: _profile,
        child: ControllerScope<JumpAnalysesController>(
          controller: _analyses,
          child: RoleShellScaffold(
            navigationShell: widget.navigationShell,
            destinations: AthleteShell.destinations,
          ),
        ),
      );
    },
  );
}
