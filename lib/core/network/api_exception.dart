import 'package:dio/dio.dart';

import 'error_code.dart';

/// Excepción de dominio para errores de la API. Trae el `code` estable del
/// backend para que la UI traduzca (ver `ErrorMessageResolver`) sin parsear `message`.
class ApiException implements Exception {
  const ApiException(this.message, this.code, {this.statusCode});

  final String message;
  final ErrorCode code;
  final int? statusCode;

  factory ApiException.fromDioError(DioException error) {
    final data = error.response?.data;
    final detail = data is Map ? data['detail'] : null;
    final code = data is Map ? data['code'] as String? : null;
    final message = detail is String
        ? detail
        : (error.message ?? 'Network error');
    return ApiException(
      message,
      ErrorCode.fromWire(code),
      statusCode: error.response?.statusCode,
    );
  }

  @override
  String toString() => message;
}
