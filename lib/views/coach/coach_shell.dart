import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/app_scope.dart';
import '../../controllers/loadable_controller.dart';
import '../../widgets/controller_scope.dart';
import '../../widgets/role_shell_scaffold.dart';
import '../athlete/athlete_profile_form.dart';

/// Shell de COACH: su plantilla y los análisis del equipo se cargan una vez y
/// los comparten las pestañas. El "+" central da de alta un deportista
/// gestionado desde cualquier pestaña.
class CoachShell extends StatefulWidget {
  const CoachShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  static const List<ShellDestination> destinations = [
    ShellDestination(
      labelKey: 'navHome',
      icon: Icons.groups_outlined,
      selectedIcon: Icons.groups,
    ),
    ShellDestination(
      labelKey: 'navTeamAnalyses',
      icon: Icons.video_library_outlined,
      selectedIcon: Icons.video_library,
    ),
    ShellDestination(
      labelKey: 'navStats',
      icon: Icons.insights_outlined,
      selectedIcon: Icons.insights,
    ),
    ShellDestination(
      labelKey: 'navProfile',
      icon: Icons.person_outline,
      selectedIcon: Icons.person,
    ),
  ];

  @override
  State<CoachShell> createState() => _CoachShellState();
}

class _CoachShellState extends State<CoachShell> {
  late final CoachAthletesController _athletes;
  late final JumpAnalysesController _teamAnalyses;

  @override
  void initState() {
    super.initState();
    final scope = AppScope.read(context);
    _athletes = CoachAthletesController(scope.managedAthleteApi.list)..load();
    _teamAnalyses = JumpAnalysesController(scope.jumpAnalysisApi.listTeam)
      ..load();
  }

  @override
  void dispose() {
    _athletes.dispose();
    _teamAnalyses.dispose();
    super.dispose();
  }

  Future<void> _createAthlete() async {
    final saved = await AthleteProfileForm.openAsPage(
      context,
      titleKey: 'newManagedAthlete',
      actionKey: 'saveChanges',
      askFullName: true,
      onSubmit: AppScope.read(context).managedAthleteApi.create,
    );
    if (saved) _athletes.load();
  }

  @override
  Widget build(BuildContext context) =>
      ControllerScope<CoachAthletesController>(
        controller: _athletes,
        child: ControllerScope<JumpAnalysesController>(
          controller: _teamAnalyses,
          child: RoleShellScaffold(
            navigationShell: widget.navigationShell,
            destinations: CoachShell.destinations,
            centerAction: ShellCenterAction(
              tooltipKey: 'newManagedAthlete',
              icon: Icons.add,
              onPressed: _createAthlete,
            ),
          ),
        ),
      );
}
