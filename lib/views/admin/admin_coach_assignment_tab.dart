import 'package:flutter/material.dart';

import '../../app/app_scope.dart';
import '../../core/localization/app_localizations.dart';
import '../../models/athlete/athlete_profile.dart';
import '../../models/auth/current_user.dart';
import '../../models/user_role.dart';
import '../../widgets/app_card.dart';

/// Asignación de entrenador a deportista (`PATCH /athletes/{id}/coach`), sólo ADMIN.
class AdminCoachAssignmentTab extends StatelessWidget {
  const AdminCoachAssignmentTab({
    super.key,
    required this.athletes,
    required this.coaches,
    required this.onCoachAssigned,
  });

  final List<AthleteProfile> athletes;
  final List<CurrentUser> coaches;
  final VoidCallback onCoachAssigned;

  Future<void> _assignCoach(
    BuildContext context,
    AthleteProfile athlete,
    int coachId,
  ) async {
    if (coachId == athlete.coachId) return;
    await AppScope.of(
      context,
    ).athleteApi.assignCoach(athleteId: athlete.id, coachId: coachId);
    onCoachAssigned();
  }

  @override
  Widget build(BuildContext context) {
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
                leading: const Icon(Icons.directions_run),
                title: Text(athlete.sport),
                subtitle: Text('${context.tr('athlete')} #${athlete.userId}'),
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
