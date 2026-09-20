import 'package:flutter/material.dart';

import '../../app/app_scope.dart';
import '../../core/localization/app_localizations.dart';
import '../../models/athlete/athlete_profile.dart';
import '../../models/auth/current_user.dart';
import '../../widgets/retry_state.dart';
import '../../widgets/role_home_scaffold.dart';
import 'admin_coach_assignment_tab.dart';
import 'admin_users_tab.dart';

/// Home de ADMIN: gestión de usuarios (cambio de rol) y asignación de coach
/// a deportistas. Ambas listas se cargan una vez aquí y se pasan a cada tab,
/// porque la asignación de coach necesita el mismo listado de usuarios.
class AdminHomeView extends StatefulWidget {
  const AdminHomeView({super.key});

  @override
  State<AdminHomeView> createState() => _AdminHomeViewState();
}

class _AdminHomeViewState extends State<AdminHomeView> {
  late Future<(List<CurrentUser>, List<AthleteProfile>)> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<(List<CurrentUser>, List<AthleteProfile>)> _load() async {
    final scope = AppScope.of(context);
    final users = await scope.userApi.list();
    final athletes = await scope.athleteApi.listAll();
    return (users, athletes);
  }

  void _reload() => setState(() => _future = _load());

  @override
  Widget build(BuildContext context) => DefaultTabController(
    length: 2,
    child: RoleHomeScaffold(
      titleKey: 'adminHomeTitle',
      bottom: TabBar(
        tabs: [
          Tab(text: context.tr('adminUsersTab')),
          Tab(text: context.tr('adminAthletesTab')),
        ],
      ),
      body: FutureBuilder<(List<CurrentUser>, List<AthleteProfile>)>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return RetryState(messageKey: 'errorGeneric', onRetry: _reload);
          }
          final (users, athletes) = snapshot.data!;
          return TabBarView(
            children: [
              AdminUsersTab(users: users, onRoleChanged: _reload),
              AdminCoachAssignmentTab(
                athletes: athletes,
                coaches: users,
                onCoachAssigned: _reload,
              ),
            ],
          );
        },
      ),
    ),
  );
}
