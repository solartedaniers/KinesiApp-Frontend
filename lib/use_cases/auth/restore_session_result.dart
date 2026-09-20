import '../../models/auth/current_user.dart';

/// Resultado de intentar restaurar la sesión al arrancar: 3 casos posibles,
/// cada uno con su propia data, sin banderas booleanas sueltas.
sealed class RestoreSessionResult {
  const RestoreSessionResult();
}

class RestoreSessionAuthenticated extends RestoreSessionResult {
  const RestoreSessionAuthenticated(this.user);

  final CurrentUser user;
}

class RestoreSessionUnauthenticated extends RestoreSessionResult {
  const RestoreSessionUnauthenticated();
}

/// GET /auth/me falló por red (o un error que no es un 401 concluyente): hay
/// que reintentar, no borrar los tokens ni dar la sesión por cerrada.
class RestoreSessionNetworkError extends RestoreSessionResult {
  const RestoreSessionNetworkError();
}
