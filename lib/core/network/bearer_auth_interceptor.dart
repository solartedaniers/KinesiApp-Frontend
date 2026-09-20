import 'package:dio/dio.dart';

import '../storage/secure_session_storage.dart';
import 'api_paths.dart';

/// Única responsabilidad: inyectar `Authorization: Bearer <access_token>` en
/// cada request saliente que no sea un endpoint público de auth.
class BearerAuthInterceptor extends Interceptor {
  BearerAuthInterceptor(this._storage);

  final SecureSessionStorage _storage;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    if (!ApiPaths.public.any(options.path.contains)) {
      final token = await _storage.readAccessToken();
      if (token != null) options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }
}
