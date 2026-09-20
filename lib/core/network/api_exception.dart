import 'package:dio/dio.dart';

/// Excepción de dominio para errores de la API, con el mensaje ya extraído
/// del cuerpo `{"detail": ...}` que devuelve el backend FastAPI.
class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  factory ApiException.fromDioError(DioException error) {
    final data = error.response?.data;
    final detail = data is Map ? data['detail'] : null;
    final message = detail is String ? detail : (error.message ?? 'Error de conexión con el servidor');
    return ApiException(message, statusCode: error.response?.statusCode);
  }

  @override
  String toString() => message;
}
