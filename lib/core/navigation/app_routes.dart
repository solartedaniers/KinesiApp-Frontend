/// Rutas de navegación de go_router, en un único lugar: ninguna pantalla
/// escribe un path de ruta suelto.
abstract final class AppRoutes {
  static const String splash = '/splash';
  static const String login = '/login';
  static const String register = '/register';
  static const String verifyEmail = '/verify-email';
  // Sin ruta propia: si el atleta no tiene perfil todavía, athleteHome muestra
  // el alta de perfil en vez del contenido normal (ver AthleteHomeView).
  static const String athleteHome = '/athlete';
  static const String coachHome = '/coach';
  static const String adminHome = '/admin';
}
