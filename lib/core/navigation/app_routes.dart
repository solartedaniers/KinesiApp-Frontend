/// Rutas de navegación de go_router, en un único lugar: ninguna pantalla
/// escribe un path de ruta suelto.
abstract final class AppRoutes {
  static const String splash = '/splash';
  static const String login = '/login';
  static const String register = '/register';
  static const String verifyEmail = '/verify-email';
  static const String passwordRecovery = '/password-recovery';
  // Sin ruta propia: si el atleta no tiene perfil todavía, athleteHome muestra
  // el alta de perfil en vez del contenido normal (ver AthleteHomeView).
  static const String athleteHome = '/athlete';
  static const String coachHome = '/coach';
  static const String coachAthleteDetail = '/coach/athlete';
  static const String adminHome = '/admin';
  static const String videoConsent = '/analysis/consent';
  static const String videoCapture = '/analysis/capture';
  static const String videoUpload = '/analysis/upload';
  static const String analysisStatus = '/analysis/status';
  static const String analysisChat = '/analysis/chat';
}
