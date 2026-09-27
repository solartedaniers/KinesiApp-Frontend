import '../models/auth/current_user.dart';
import '../models/user_role.dart';

/// Abstracción de la sesión de auth: los use cases dependen de esto, no de
/// [AuthApi]/[SecureSessionStorage] directamente.
abstract interface class AuthRepository {
  Future<CurrentUser> register({
    required String email,
    required String password,
    required String fullName,
    required UserRole role,
  });

  Future<CurrentUser> verifyEmail({
    required String email,
    required String code,
  });

  Future<void> requestVerificationCode({required String email});

  Future<void> requestPasswordReset({required String email});

  Future<void> verifyPasswordResetCode({
    required String email,
    required String code,
  });

  /// Guarda los tokens nuevos que emite el backend tras el cambio.
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  });

  Future<void> confirmPasswordReset({
    required String email,
    required String code,
    required String newPassword,
  });

  Future<CurrentUser> login({required String email, required String password});

  /// Sólo consulta al backend; no toca el almacenamiento local.
  Future<CurrentUser> fetchCurrentUser();

  Future<void> logout();

  Future<bool> hasStoredSession();
}
