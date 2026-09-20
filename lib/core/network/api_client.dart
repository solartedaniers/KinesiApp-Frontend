import 'package:dio/dio.dart';

import '../config/api_config.dart';
import '../storage/secure_session_storage.dart';
import 'auth_interceptor.dart';

/// Punto único de construcción del cliente HTTP de la app, ya con la URL base
/// resuelta por plataforma y el interceptor de autenticación instalado.
class ApiClient {
  const ApiClient._();

  static Dio create(SecureSessionStorage storage) {
    // Dio "limpio" sin AuthInterceptor: lo usa el interceptor para /auth/refresh
    // y para reintentar la petición original, evitando así un ciclo de interceptores.
    final refreshDio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));
    final dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));
    dio.interceptors.add(AuthInterceptor(storage, refreshDio));
    return dio;
  }
}
