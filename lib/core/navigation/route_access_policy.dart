import '../../models/user_role.dart';
import 'app_routes.dart';

/// Qué rutas puede abrir cada rol autenticado. El router redirige a la home del
/// rol cualquier ruta que no esté aquí (p. ej. un deportista escribiendo /admin).
abstract final class RouteAccessPolicy {
  // El flujo de análisis lo usa el deportista con su perfil y el coach con sus
  // deportistas gestionados; el backend vuelve a validar el acceso por perfil.
  static const Set<String> _analysisRoutes = {
    AppRoutes.videoConsent,
    AppRoutes.videoCapture,
    AppRoutes.videoUpload,
    AppRoutes.analysisStatus,
    AppRoutes.analysisChat,
  };

  static const Map<UserRole, Set<String>> _routesByRole = {
    UserRole.athlete: {AppRoutes.athleteHome, ..._analysisRoutes},
    UserRole.coach: {
      AppRoutes.coachHome,
      AppRoutes.coachAthleteDetail,
      ..._analysisRoutes,
    },
    UserRole.admin: {AppRoutes.adminHome},
  };

  static bool canAccess(UserRole role, String location) =>
      _routesByRole[role]!.contains(location);
}
