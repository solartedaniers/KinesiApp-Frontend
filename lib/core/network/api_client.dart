import 'package:dio/dio.dart';

import '../config/api_config.dart';
import '../storage/secure_session_storage.dart';
import 'bearer_auth_interceptor.dart';
import 'token_refresh_interceptor.dart';

/// Punto único de construcción del cliente HTTP de la app: URL base resuelta
/// por entorno (ver [ApiConfig]) y la cadena de interceptores de auth instalada.
class ApiClient {
  const ApiClient._();

  static Dio create(
    SecureSessionStorage storage, {
    required Future<void> Function() onSessionExpired,
  }) {
    // Dio "limpio" sin interceptores: lo usa TokenRefreshInterceptor para /auth/refresh
    // y para reintentar la petición original, evitando así un ciclo de interceptores.
    final refreshDio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));
    final dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));
    dio.interceptors.addAll([
      BearerAuthInterceptor(storage),
      TokenRefreshInterceptor(
        storage,
        refreshDio,
        onSessionExpired: onSessionExpired,
      ),
    ]);
    return dio;
  }
}
