import 'package:flutter/material.dart';

import '../../app/app_scope.dart';
import '../../core/localization/app_localizations.dart';
import '../../models/auth/current_user.dart';
import '../../models/user_role.dart';
import '../../widgets/app_card.dart';

/// Lista de usuarios con cambio de rol (`PATCH /users/{id}/role`).
class AdminUsersTab extends StatelessWidget {
  const AdminUsersTab({
    super.key,
    required this.users,
    required this.onRoleChanged,
  });

  final List<CurrentUser> users;
  final VoidCallback onRoleChanged;

  Future<void> _changeRole(
    BuildContext context,
    CurrentUser user,
    UserRole role,
  ) async {
    if (role == user.role) return;
    await AppScope.of(context).userApi.updateRole(userId: user.id, role: role);
    onRoleChanged();
  }

  String _roleKey(UserRole role) => switch (role) {
    UserRole.athlete => 'athlete',
    UserRole.coach => 'coach',
    UserRole.admin => 'admin',
  };

  @override
  Widget build(BuildContext context) {
    if (users.isEmpty) return Center(child: Text(context.tr('noUsers')));
    return ListView(
      padding: const EdgeInsets.all(20),
      children: users
          .map(
            (user) => AppCard(
              child: ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.person_outline),
                title: Text(user.fullName),
                subtitle: Text(user.email),
                trailing: DropdownButton<UserRole>(
                  value: user.role,
                  items: UserRole.values
                      .map(
                        (role) => DropdownMenuItem(
                          value: role,
                          child: Text(context.tr(_roleKey(role))),
                        ),
                      )
                      .toList(),
                  onChanged: (role) =>
                      role == null ? null : _changeRole(context, user, role),
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}
