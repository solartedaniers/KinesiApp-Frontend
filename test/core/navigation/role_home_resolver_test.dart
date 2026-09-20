import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/core/navigation/app_routes.dart';
import 'package:frontend/core/navigation/role_home_resolver.dart';
import 'package:frontend/models/user_role.dart';

void main() {
  test('resolves each role to its own home route', () {
    expect(RoleHomeResolver.resolve(UserRole.athlete), AppRoutes.athleteHome);
    expect(RoleHomeResolver.resolve(UserRole.coach), AppRoutes.coachHome);
    expect(RoleHomeResolver.resolve(UserRole.admin), AppRoutes.adminHome);
  });
}
