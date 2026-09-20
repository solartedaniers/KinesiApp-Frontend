import 'package:dio/dio.dart';

import '../../core/network/api_exception.dart';
import '../../core/network/api_paths.dart';
import '../../models/auth/auth_tokens.dart';
import '../../models/auth/current_user.dart';

/// Envoltorio delgado sobre Dio para los endpoints /auth del backend FastAPI.
class AuthApi {
  AuthApi(this._dio);

  final Dio _dio;

  /// El registro siempre crea un usuario ATHLETE (regla del backend); requiere
  /// luego verifyEmail con el código OTP enviado por correo antes de poder hacer login.
  Future<CurrentUser> register({
    required String email,
    required String password,
    required String fullName,
  }) async {
    try {
      final response = await _dio.post(
        ApiPaths.register,
        data: {'email': email, 'password': password, 'full_name': fullName},
      );
      return CurrentUser.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<AuthTokens> verifyEmail({
    required String email,
    required String code,
  }) async {
    try {
      final response = await _dio.post(
        ApiPaths.verifyEmail,
        data: {'email': email, 'code': code},
      );
      return AuthTokens.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<AuthTokens> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        ApiPaths.login,
        data: {'email': email, 'password': password},
      );
      return AuthTokens.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<CurrentUser> me() async {
    try {
      final response = await _dio.get(ApiPaths.me);
      return CurrentUser.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> logout(String refreshToken) async {
    try {
      await _dio.post(ApiPaths.logout, data: {'refresh_token': refreshToken});
    } on DioException {
      // Logout es best-effort: si el backend falla igual limpiamos la sesión local.
    }
  }
}
