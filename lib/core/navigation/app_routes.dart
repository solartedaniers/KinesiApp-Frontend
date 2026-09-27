/// Rutas de navegación de go_router, en un único lugar: ninguna pantalla
/// escribe un path de ruta suelto.
abstract final class AppRoutes {
  static const String splash = '/splash';
  static const String login = '/login';
  static const String register = '/register';
  static const String verifyEmail = '/verify-email';

  // Recuperación de contraseña en 3 pasos: correo → código → nueva contraseña
  static const String passwordRecovery = '/password-recovery';
  static const String passwordRecoveryCode = '/password-recovery/code';
  static const String passwordRecoveryNewPassword =
      '/password-recovery/new-password';

  // Pestañas de la barra inferior del deportista. Sin ruta de alta de perfil:
  // si aún no tiene ficha, AthleteShell muestra el formulario obligatorio.
  static const String athleteHome = '/athlete';
  static const String athletePhysicalProfile = '/athlete/profile';
  static const String athleteAnalyses = '/athlete/analyses';
  static const String athleteStats = '/athlete/stats';

  // Pestañas del coach; la ficha de un deportista se apila encima
  static const String coachHome = '/coach';
  static const String coachTeamAnalyses = '/coach/analyses';
  static const String coachStats = '/coach/stats';
  static const String coachProfile = '/coach/profile';
  static const String coachAthleteDetail = '/coach/athlete';

  static const String adminHome = '/admin';
  static const String adminUsers = '/admin/users';
  static const String adminAssignments = '/admin/assignments';
  static const String adminProfile = '/admin/profile';

  /// Compartida por los tres roles desde su pestaña de perfil.
  static const String changePassword = '/account/password';

  static const String videoConsent = '/analysis/consent';
  static const String videoCapture = '/analysis/capture';
  static const String videoUpload = '/analysis/upload';
  static const String analysisStatus = '/analysis/status';
  static const String analysisChat = '/analysis/chat';
}
