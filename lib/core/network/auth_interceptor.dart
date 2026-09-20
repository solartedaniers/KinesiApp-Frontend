import 'package:dio/dio.dart';

import '../../models/auth/auth_tokens.dart';
import '../storage/secure_session_storage.dart';

/// Interceptor de autenticación:
/// 1. Inyecta `Authorization: Bearer <access_token>` en cada request saliente.
/// 2. Ante un 401 en un endpoint protegido, intenta refrescar el token una sola vez
///    (con guarda para no disparar refresh en paralelo) y reintenta la petición original;
///    si el refresh falla, limpia la sesión y propaga el error original.
class AuthInterceptor extends Interceptor {
  AuthInterceptor(this._storage, this._refreshDio);

  final SecureSessionStorage _storage;
  final Dio _refreshDio; // Dio "limpio" (sin este interceptor), usado sólo para /auth/refresh y el retry

  // Comparte un único refresh en curso entre todas las peticiones que reciban 401 a la vez.
  Future<String?>? _ongoingRefresh;

  // Endpoints que nunca deben llevar el header Authorization ni disparar un refresh.
  static const _publicPaths = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/verify-email'];

  @override
  Future<void> onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    if (!_publicPaths.any(options.path.contains)) {
      final token = await _storage.readAccessToken();
      if (token != null) options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    final isUnauthorized = err.response?.statusCode == 401;
    final isAuthEndpoint = _publicPaths.any(err.requestOptions.path.contains);
    if (!isUnauthorized || isAuthEndpoint) {
      handler.next(err);
      return;
    }

    final newAccessToken = await (_ongoingRefresh ??= _refreshToken());
    _ongoingRefresh = null;

    if (newAccessToken == null) {
      await _storage.clear();
      handler.next(err);
      return;
    }

    try {
      final retryOptions = err.requestOptions..headers['Authorization'] = 'Bearer $newAccessToken';
      final response = await _refreshDio.fetch(retryOptions);
      handler.resolve(response);
    } on DioException catch (retryError) {
      handler.next(retryError);
    }
  }

  Future<String?> _refreshToken() async {
    final refreshToken = await _storage.readRefreshToken();
    if (refreshToken == null) return null;
    try {
      final response = await _refreshDio.post('/auth/refresh', data: {'refresh_token': refreshToken});
      final tokens = AuthTokens.fromJson(response.data as Map<String, dynamic>);
      await _storage.saveTokens(tokens);
      return tokens.accessToken;
    } on DioException {
      return null;
    }
  }
}
