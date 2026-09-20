import 'package:flutter/foundation.dart';

import '../../models/auth/current_user.dart';
import '../../models/auth/session_status.dart';
import '../../use_cases/auth/login_use_case.dart';
import '../../use_cases/auth/logout_use_case.dart';
import '../../use_cases/auth/register_use_case.dart';
import '../../use_cases/auth/restore_session_result.dart';
import '../../use_cases/auth/restore_session_use_case.dart';
import '../../use_cases/auth/verify_email_use_case.dart';

/// Único punto que la UI observa para saber el estado de sesión. Orquesta los
/// use cases de auth; no conoce Dio, tokens ni almacenamiento directamente.
class SessionController extends ChangeNotifier {
  SessionController({
    required LoginUseCase login,
    required RegisterUseCase register,
    required VerifyEmailUseCase verifyEmail,
    required LogoutUseCase logout,
    required RestoreSessionUseCase restoreSession,
  }) : _login = login,
       _register = register,
       _verifyEmail = verifyEmail,
       _logout = logout,
       _restoreSession = restoreSession;

  final LoginUseCase _login;
  final RegisterUseCase _register;
  final VerifyEmailUseCase _verifyEmail;
  final LogoutUseCase _logout;
  final RestoreSessionUseCase _restoreSession;

  SessionStatus _status = SessionStatus.unknown;
  CurrentUser? _currentUser;
  bool _hasRestoreError = false;
  bool _isLoading = false;

  SessionStatus get status => _status;
  CurrentUser? get currentUser => _currentUser;

  /// `status` sigue en `unknown` porque restoreSession() falló por red, no
  /// porque todavía no se resolvió: la UI muestra "reintentar", no un splash infinito.
  bool get hasRestoreError => _hasRestoreError;
  bool get isLoading => _isLoading;

  Future<void> restoreSession() async {
    final result = await _restoreSession();
    switch (result) {
      case RestoreSessionAuthenticated(user: final user):
        _hasRestoreError = false;
        _setAuthenticated(user);
      case RestoreSessionUnauthenticated():
        _hasRestoreError = false;
        _setUnauthenticated();
      case RestoreSessionNetworkError():
        _hasRestoreError = true;
        notifyListeners();
    }
  }

  Future<void> login({required String email, required String password}) =>
      _runAuthFlow(
        () async =>
            _setAuthenticated(await _login(email: email, password: password)),
      );

  /// Registra un usuario nuevo (siempre ATHLETE); no autentica por sí solo,
  /// falta verifyEmail con el código OTP enviado por correo.
  Future<void> register({
    required String email,
    required String password,
    required String fullName,
  }) => _runAuthFlow(
    () => _register(email: email, password: password, fullName: fullName),
  );

  Future<void> verifyEmail({required String email, required String code}) =>
      _runAuthFlow(
        () async =>
            _setAuthenticated(await _verifyEmail(email: email, code: code)),
      );

  Future<void> logout() async {
    await _logout();
    _setUnauthenticated();
  }

  /// Lo invoca la red (TokenRefreshInterceptor) cuando un refresh falla: la
  /// sesión ya se limpió del storage, sólo falta reflejarlo en el estado.
  void expireSession() => _setUnauthenticated();

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

  void _setAuthenticated(CurrentUser user) {
    _currentUser = user;
    _status = SessionStatus.authenticated;
    notifyListeners();
  }

  void _setUnauthenticated() {
    _currentUser = null;
    _status = SessionStatus.unauthenticated;
    notifyListeners();
  }
}
