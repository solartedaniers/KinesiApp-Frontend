import 'package:flutter/material.dart';

import '../../controllers/loadable_controller.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/user_role.dart';
import '../../widgets/controller_scope.dart';
import '../../widgets/loadable_view.dart';
import '../../widgets/stat_grid.dart';
import '../../widgets/welcome_header.dart';

/// Pestaña Inicio del admin: resumen de usuarios por rol y deportistas que
/// aún no tienen coach asignado.
class AdminHomeView extends StatelessWidget {
  const AdminHomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return LoadableView(
      controller: ControllerScope.of<AdminDataController>(context),
      builder: (context, data) {
        int countRole(UserRole role) =>
            data.users.where((u) => u.role == role).length;
        return ListView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
            WelcomeHeader(hintKey: 'adminHomeHint'),
            const SizedBox(height: AppSpacing.lg),
            StatGrid(
              items: [
                StatItem(
                  labelKey: 'statsUsers',
                  value: '${data.users.length}',
                  icon: Icons.people_outline,
                ),
                StatItem(
                  labelKey: 'statsCoaches',
                  value: '${countRole(UserRole.coach)}',
                  icon: Icons.sports_outlined,
                ),
                StatItem(
                  labelKey: 'statsAthletes',
                  value: '${data.athletes.length}',
                  icon: Icons.directions_run,
                ),
                StatItem(
                  labelKey: 'statsUnassignedAthletes',
                  value:
                      '${data.athletes.where((a) => a.coachId == null).length}',
                  icon: Icons.person_search_outlined,
                ),
              ],
            ),
          ],
        );
      },
    );
  }
}
