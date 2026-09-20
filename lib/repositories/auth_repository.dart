import '../models/auth/current_user.dart';

/// Abstracción de la sesión de auth: los use cases dependen de esto, no de
/// [AuthApi]/[SecureSessionStorage] directamente.
abstract interface class AuthRepository {
  Future<CurrentUser> register({
    required String email,
    required String password,
    required String fullName,
  });

  Future<CurrentUser> verifyEmail({
    required String email,
    required String code,
  });

  Future<CurrentUser> login({required String email, required String password});

  /// Sólo consulta al backend; no toca el almacenamiento local.
  Future<CurrentUser> fetchCurrentUser();

  Future<void> logout();

  Future<bool> hasStoredSession();
}
