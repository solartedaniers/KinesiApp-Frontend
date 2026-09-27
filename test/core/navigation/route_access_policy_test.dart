import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/core/navigation/app_routes.dart';
import 'package:frontend/core/navigation/route_access_policy.dart';
import 'package:frontend/models/user_role.dart';

void main() {
  test('each role only reaches its own screens', () {
    expect(
      RouteAccessPolicy.canAccess(UserRole.athlete, AppRoutes.athleteHome),
      isTrue,
    );
    expect(
      RouteAccessPolicy.canAccess(UserRole.athlete, AppRoutes.adminHome),
      isFalse,
    );
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
      RouteAccessPolicy.canAccess(UserRole.admin, AppRoutes.videoCapture),
      isFalse,
    );
  });

  test('auth screens are not reachable once authenticated', () {
    for (final role in UserRole.values) {
      expect(RouteAccessPolicy.canAccess(role, AppRoutes.login), isFalse);
      expect(RouteAccessPolicy.canAccess(role, AppRoutes.splash), isFalse);
    }
  });
}
