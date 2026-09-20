import '../core/storage/secure_session_storage.dart';
import '../models/auth/current_user.dart';
import '../services/auth/auth_api.dart';
import 'auth_repository.dart';

/// Implementación real de [AuthRepository]: compone la API remota con el
/// almacenamiento seguro local (guardar/leer/borrar tokens).
class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl(this._api, this._storage);

  final AuthApi _api;
  final SecureSessionStorage _storage;

  @override
  Future<CurrentUser> register({
    required String email,
    required String password,
    required String fullName,
  }) => _api.register(email: email, password: password, fullName: fullName);

  @override
  Future<CurrentUser> verifyEmail({
    required String email,
    required String code,
  }) async {
    final tokens = await _api.verifyEmail(email: email, code: code);
    await _storage.saveTokens(tokens);
    return _api.me();
  }

  @override
  Future<CurrentUser> login({
    required String email,
    required String password,
  }) async {
    final tokens = await _api.login(email: email, password: password);
    await _storage.saveTokens(tokens);
    return _api.me();
  }

  @override
  Future<CurrentUser> fetchCurrentUser() => _api.me();

  @override
  Future<void> logout() async {
    final refreshToken = await _storage.readRefreshToken();
    if (refreshToken != null) await _api.logout(refreshToken);
    await _storage.clear();
  }

  @override
  Future<bool> hasStoredSession() async =>
      await _storage.readAccessToken() != null;
}
