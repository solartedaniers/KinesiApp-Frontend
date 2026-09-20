/// Rutas de la API (relativas a [ApiConfig.baseUrl]), en un único lugar para
/// que ningún cliente HTTP escriba un string de endpoint suelto.
abstract final class ApiPaths {
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String verifyEmail = '/auth/verify-email';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';

  static const String athleteMe = '/athletes/me';
  static const String athletesCoached = '/athletes/coached';
  static const String athletes = '/athletes';
  static String athleteCoach(int athleteId) => '/athletes/$athleteId/coach';

  static const String jumpAnalysesByAthlete = '/jump-analyses/by-athlete';
  static String jumpAnalysesForAthlete(int athleteId) =>
      '$jumpAnalysesByAthlete/$athleteId';

  static const String users = '/users';
  static String userRole(int userId) => '/users/$userId/role';

  /// Endpoints que nunca llevan `Authorization` ni disparan un refresh de token.
  static const List<String> public = [login, register, refresh, verifyEmail];
}
