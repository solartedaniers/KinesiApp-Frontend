import '../../models/user_role.dart';
import 'app_routes.dart';

/// Strategy de "a qué pantalla de inicio va cada rol": un mapa en vez de una
/// cadena de if/else, así agregar un rol nuevo no toca lógica de navegación.
abstract final class RoleHomeResolver {
  static const Map<UserRole, String> _homeByRole = {
    UserRole.athlete: AppRoutes.athleteHome,
    UserRole.coach: AppRoutes.coachHome,
    UserRole.admin: AppRoutes.adminHome,
  };

  static String resolve(UserRole role) => _homeByRole[role]!;
}
