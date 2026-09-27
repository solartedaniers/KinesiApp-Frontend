/// Rutas de la API (relativas a [ApiConfig.baseUrl]), en un único lugar para
/// que ningún cliente HTTP escriba un string de endpoint suelto.
abstract final class ApiPaths {
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String verifyEmail = '/auth/verify-email';
  static const String requestVerificationCode =
      '/auth/verification-code/request';
  static const String requestPasswordReset = '/auth/password-recovery/request';
  static const String verifyPasswordResetCode =
      '/auth/password-recovery/verify';
  static const String confirmPasswordReset = '/auth/password-recovery/confirm';
  static const String changePassword = '/auth/password/change';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';
  static const String videoConsent = '/users/me/video-consent';
  static const String myProfile = '/users/me';
  static const String myAvatar = '/users/me/avatar';

  static const String athleteMe = '/athletes/me';
  static const String athletesCoached = '/athletes/coached';
  static const String athletes = '/athletes';
  static String athleteCoach(int athleteId) => '/athletes/$athleteId/coach';

  static const String coachAthletes = '/coach/athletes';
  static String coachAthlete(int athleteId) => '$coachAthletes/$athleteId';
  static String coachAthleteAvatar(int athleteId) =>
      '${coachAthlete(athleteId)}/avatar';

  static const String teamJumpAnalyses = '/jump-analyses/team';
  static const String jumpAnalysesByAthlete = '/jump-analyses/by-athlete';
  static String jumpAnalysesForAthlete(int athleteId) =>
      '$jumpAnalysesByAthlete/$athleteId';
  static const String uploadJumpVideo = '/jump-analyses/upload';
  static String jumpAnalysis(int analysisId) => '/jump-analyses/$analysisId';

  static const String users = '/users';
  static String userRole(int userId) => '/users/$userId/role';

  /// Endpoints que nunca llevan `Authorization` ni disparan un refresh de token.
  static const List<String> public = [
    login,
    register,
    refresh,
    verifyEmail,
    requestVerificationCode,
    requestPasswordReset,
    verifyPasswordResetCode,
    confirmPasswordReset,
  ];
}
