import 'dart:async';

import 'package:dio/dio.dart';

import '../../models/auth/auth_tokens.dart';
import '../storage/secure_session_storage.dart';
import 'api_paths.dart';

/// Única responsabilidad: ante un 401 en un endpoint protegido, refresca el
/// access token y reintenta la petición original una sola vez.
///
/// El refresh es single-flight con [Completer]: si varias peticiones reciben
/// 401 a la vez, todas esperan el mismo refresh en curso en vez de disparar
/// uno cada una. Usa un Dio aparte (sin interceptores) para no depender de sí
/// mismo al llamar /auth/refresh o reintentar la petición original.
class TokenRefreshInterceptor extends Interceptor {
  TokenRefreshInterceptor(
    this._storage,
    this._refreshDio, {
    required this.onSessionExpired,
  });

  final SecureSessionStorage _storage;
  final Dio _refreshDio;
  final Future<void> Function() onSessionExpired;

  Completer<String?>? _ongoingRefresh;

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    final isUnauthorized = err.response?.statusCode == 401;
    final isAuthEndpoint = ApiPaths.public.any(
      err.requestOptions.path.contains,
    );
    if (!isUnauthorized || isAuthEndpoint) {
      handler.next(err);
      return;
    }

    final newAccessToken = await _refreshOnce();
    if (newAccessToken == null) {
      handler.next(err);
      return;
    }

    try {
      final retryOptions = err.requestOptions
        ..headers['Authorization'] = 'Bearer $newAccessToken';
      final response = await _refreshDio.fetch(retryOptions);
      handler.resolve(response);
    } on DioException catch (retryError) {
      handler.next(retryError);
    }
  }

  Future<String?> _refreshOnce() {
    final ongoing = _ongoingRefresh;
    if (ongoing != null) return ongoing.future;

    final completer = Completer<String?>();
    _ongoingRefresh = completer;
    unawaited(
      _refreshToken()
          .then(completer.complete)
          .whenComplete(() => _ongoingRefresh = null),
    );
    return completer.future;
  }

  /// Corre una sola vez por refresh en curso (protegido por [_refreshOnce]),
  /// así que limpiar la sesión y notificar el vencimiento acá adentro
  /// garantiza que ocurra exactamente una vez aunque varias peticiones
  /// hayan disparado el refresh a la vez.
  Future<String?> _refreshToken() async {
    final refreshToken = await _storage.readRefreshToken();
    if (refreshToken == null) {
      await _expireSession();
      return null;
    }
    try {
      final response = await _refreshDio.post(
        ApiPaths.refresh,
        data: {'refresh_token': refreshToken},
      );
      final tokens = AuthTokens.fromJson(response.data as Map<String, dynamic>);
      await _storage.saveTokens(tokens);
      return tokens.accessToken;
    } on DioException {
      await _expireSession();
      return null;
    }
  }

  Future<void> _expireSession() async {
    await _storage.clear();
    await onSessionExpired();
  }
}
