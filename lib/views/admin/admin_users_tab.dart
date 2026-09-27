import 'package:flutter/material.dart';

import '../../app/app_scope.dart';
import '../../core/localization/app_localizations.dart';
import '../../models/auth/current_user.dart';
import '../../models/user_role.dart';
import '../../controllers/loadable_controller.dart';
import '../../widgets/app_card.dart';
import '../../widgets/controller_scope.dart';
import '../../widgets/loadable_view.dart';
import '../../widgets/user_avatar.dart';

/// Pestaña Usuarios del admin: lista con cambio de rol (`PATCH /users/{id}/role`).
class AdminUsersTab extends StatelessWidget {
  const AdminUsersTab({super.key});

  Future<void> _changeRole(
    BuildContext context,
    CurrentUser user,
    UserRole role,
  ) async {
    if (role == user.role) return;
    final data = ControllerScope.read<AdminDataController>(context);
    await AppScope.read(
      context,
    ).userApi.updateRole(userId: user.id, role: role);
    await data.load();
  }

  String _roleKey(UserRole role) => switch (role) {
    UserRole.athlete => 'athlete',
    UserRole.coach => 'coach',
    UserRole.admin => 'admin',
  };

  @override
  Widget build(BuildContext context) => LoadableView(
    controller: ControllerScope.of<AdminDataController>(context),
    builder: (context, data) => _buildList(context, data.users),
  );

  Widget _buildList(BuildContext context, List<CurrentUser> users) {
    if (users.isEmpty) return Center(child: Text(context.tr('noUsers')));
    return ListView(
      padding: const EdgeInsets.all(20),
      children: users
          .map(
            (user) => AppCard(
              child: ListTile(
                contentPadding: EdgeInsets.zero,
                leading: UserAvatar(
                  name: user.fullName,
                  bytes: user.avatarBytes,
                ),
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
