import 'package:flutter/foundation.dart';

import '../../core/network/api_exception.dart';
import '../../core/storage/secure_session_storage.dart';
import '../../models/auth/current_user.dart';
import '../../models/user_role.dart';
import 'auth_api.dart';

/// Orquesta el estado de sesión de la app (login/registro/logout y su persistencia).
///
/// Es el único punto que la UI necesita observar para saber si hay sesión activa
/// y con qué rol, sin conocer los detalles de tokens ni de almacenamiento seguro.
class SessionController extends ChangeNotifier {
  SessionController(this._authApi, this._storage);

  final AuthApi _authApi;
  final SecureSessionStorage _storage;

  CurrentUser? _currentUser;
  bool _isLoading = false;

  CurrentUser? get currentUser => _currentUser;
  UserRole? get role => _currentUser?.role;
  bool get isAuthenticated => _currentUser != null;
  bool get isLoading => _isLoading;

  /// Restaura la sesión al arrancar la app leyendo el token guardado, si existe.
  Future<void> restoreSession() async {
    final token = await _storage.readAccessToken();
    if (token == null) return;
    try {
      _currentUser = await _authApi.me();
      notifyListeners();
    } on ApiException {
      await _storage.clear();
    }
  }

  Future<void> login({required String email, required String password}) => _runAuthFlow(() async {
        final tokens = await _authApi.login(email: email, password: password);
        await _storage.saveTokens(tokens);
        _currentUser = await _authApi.me();
      });

  /// Registra un usuario nuevo (siempre ATHLETE); no autentica por sí solo,
  /// falta verifyEmail con el código OTP enviado por correo.
  Future<void> register({required String email, required String password, required String fullName}) =>
      _runAuthFlow(() => _authApi.register(email: email, password: password, fullName: fullName));

  Future<void> verifyEmail({required String email, required String code}) => _runAuthFlow(() async {
        final tokens = await _authApi.verifyEmail(email: email, code: code);
        await _storage.saveTokens(tokens);
        _currentUser = await _authApi.me();
      });

  Future<void> logout() async {
    final refreshToken = await _storage.readRefreshToken();
    if (refreshToken != null) await _authApi.logout(refreshToken);
    await _storage.clear();
    _currentUser = null;
    notifyListeners();
  }

  Future<void> _runAuthFlow(Future<void> Function() action) async {
    _isLoading = true;
    notifyListeners();
    try {
      await action();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
