import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/core/navigation/app_routes.dart';
import 'package:frontend/core/navigation/route_access_policy.dart';
import 'package:frontend/models/user_role.dart';

void main() {
  const athleteTabs = [
    AppRoutes.athleteHome,
    AppRoutes.athletePhysicalProfile,
    AppRoutes.athleteAnalyses,
    AppRoutes.athleteStats,
  ];
  const coachTabs = [
    AppRoutes.coachHome,
    AppRoutes.coachTeamAnalyses,
    AppRoutes.coachStats,
    AppRoutes.coachProfile,
  ];
  const adminTabs = [
    AppRoutes.adminHome,
    AppRoutes.adminUsers,
    AppRoutes.adminAssignments,
    AppRoutes.adminProfile,
  ];

  test('each role reaches every tab of its own bottom bar only', () {
    final tabsByRole = {
      UserRole.athlete: athleteTabs,
      UserRole.coach: coachTabs,
      UserRole.admin: adminTabs,
    };
    for (final role in tabsByRole.keys) {
      for (final MapEntry(key: other, value: tabs) in tabsByRole.entries) {
        for (final tab in tabs) {
          expect(
            RouteAccessPolicy.canAccess(role, tab),
            other == role,
            reason: '$role → $tab',
          );
        }
      }
    }
  });

  test('shared and stacked screens follow each role', () {
    for (final role in UserRole.values) {
      expect(
        RouteAccessPolicy.canAccess(role, AppRoutes.changePassword),
        isTrue,
      );
    }
    expect(
      RouteAccessPolicy.canAccess(
        UserRole.athlete,
        AppRoutes.coachAthleteDetail,
      ),
      isFalse,
    );
    expect(
      RouteAccessPolicy.canAccess(UserRole.coach, AppRoutes.coachAthleteDetail),
      isTrue,
    );
    expect(
      RouteAccessPolicy.canAccess(UserRole.coach, AppRoutes.videoCapture),
      isTrue,
    );
    expect(
      RouteAccessPolicy.canAccess(UserRole.athlete, AppRoutes.videoCapture),
      isTrue,
    );
    expect(
      RouteAccessPolicy.canAccess(UserRole.admin, AppRoutes.videoCapture),
      isFalse,
    );
    // Detalle de una grabación: quien graba (deportista) y quien dirige (coach)
    for (final role in [UserRole.athlete, UserRole.coach]) {
      expect(
        RouteAccessPolicy.canAccess(role, AppRoutes.analysisDetail),
        isTrue,
      );
    }
    expect(
      RouteAccessPolicy.canAccess(UserRole.admin, AppRoutes.analysisDetail),
      isFalse,
    );
  });

  test('auth screens are not reachable once authenticated', () {
    for (final role in UserRole.values) {
      for (final route in [
        AppRoutes.login,
        AppRoutes.splash,
        AppRoutes.passwordRecovery,
        AppRoutes.passwordRecoveryCode,
        AppRoutes.passwordRecoveryNewPassword,
      ]) {
        expect(RouteAccessPolicy.canAccess(role, route), isFalse);
      }
    }
  });
}
