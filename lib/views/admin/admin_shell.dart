import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/app_scope.dart';
import '../../controllers/loadable_controller.dart';
import '../../widgets/controller_scope.dart';
import '../../widgets/role_shell_scaffold.dart';

/// Shell de ADMIN: usuarios y deportistas se cargan una vez y los comparten
/// resumen, gestión de roles y asignación de coach (esta última necesita
/// ambos listados a la vez).
class AdminShell extends StatefulWidget {
  const AdminShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  static const List<ShellDestination> destinations = [
    ShellDestination(
      labelKey: 'navHome',
      icon: Icons.dashboard_outlined,
      selectedIcon: Icons.dashboard,
    ),
    ShellDestination(
      labelKey: 'navUsers',
      icon: Icons.manage_accounts_outlined,
      selectedIcon: Icons.manage_accounts,
    ),
    ShellDestination(
      labelKey: 'navAssignments',
      icon: Icons.sports_outlined,
      selectedIcon: Icons.sports,
    ),
    ShellDestination(
      labelKey: 'navProfile',
      icon: Icons.person_outline,
      selectedIcon: Icons.person,
    ),
  ];

  @override
  State<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends State<AdminShell> {
  late final AdminDataController _data;

  @override
  void initState() {
    super.initState();
    final scope = AppScope.read(context);
    _data = AdminDataController(() async {
      final users = await scope.userApi.list();
      final athletes = await scope.athleteApi.listAll();
      return (users: users, athletes: athletes);
    })..load();
  }

  @override
  void dispose() {
    _data.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => ControllerScope<AdminDataController>(
    controller: _data,
    child: RoleShellScaffold(
      navigationShell: widget.navigationShell,
      destinations: AdminShell.destinations,
    ),
  );
}
