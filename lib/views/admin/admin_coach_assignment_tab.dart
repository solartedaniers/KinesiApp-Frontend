import 'package:flutter/material.dart';

import '../../app/app_scope.dart';
import '../../core/localization/app_localizations.dart';
import '../../models/athlete/athlete_profile.dart';
import '../../models/auth/current_user.dart';
import '../../models/user_role.dart';
import '../../controllers/loadable_controller.dart';
import '../../widgets/app_card.dart';
import '../../widgets/controller_scope.dart';
import '../../widgets/loadable_view.dart';
import '../../widgets/user_avatar.dart';

/// Asignación de entrenador a deportista (`PATCH /athletes/{id}/coach`), sólo ADMIN.
class AdminCoachAssignmentTab extends StatelessWidget {
  const AdminCoachAssignmentTab({super.key});

  Future<void> _assignCoach(
    BuildContext context,
    AthleteProfile athlete,
    int coachId,
  ) async {
    if (coachId == athlete.coachId) return;
    final data = ControllerScope.read<AdminDataController>(context);
    await AppScope.read(
      context,
    ).athleteApi.assignCoach(athleteId: athlete.id, coachId: coachId);
    await data.load();
  }

  @override
  Widget build(BuildContext context) => LoadableView(
    controller: ControllerScope.of<AdminDataController>(context),
    builder: (context, data) => _buildList(context, data.athletes, data.users),
  );

  Widget _buildList(
    BuildContext context,
    List<AthleteProfile> athletes,
    List<CurrentUser> coaches,
  ) {
    if (athletes.isEmpty) {
      return Center(child: Text(context.tr('noAthletesToAssign')));
    }
    final coachOptions = coaches
        .where((user) => user.role == UserRole.coach)
        .toList();
    return ListView(
      padding: const EdgeInsets.all(20),
      children: athletes
          .map(
            (athlete) => AppCard(
              child: ListTile(
                contentPadding: EdgeInsets.zero,
                leading: UserAvatar(
                  name: athlete.displayName,
                  bytes: athlete.avatarBytes,
                ),
                title: Text(athlete.displayName),
                subtitle: Text(context.tr(athlete.gender.labelKey)),
                trailing: coachOptions.isEmpty
                    ? Text(context.tr('noCoachesAvailable'))
                    : DropdownButton<int>(
                        value: athlete.coachId,
                        hint: Text(context.tr('assignCoach')),
                        items: coachOptions
                            .map(
                              (coach) => DropdownMenuItem(
                                value: coach.id,
                                child: Text(coach.fullName),
                              ),
                            )
                            .toList(),
                        onChanged: (coachId) => coachId == null
                            ? null
                            : _assignCoach(context, athlete, coachId),
                      ),
              ),
            ),
          )
          .toList(),
    );
  }
}
