import 'package:dio/dio.dart';

import '../../core/network/api_exception.dart';
import '../../core/network/api_paths.dart';
import '../../models/auth/current_user.dart';
import '../../models/user_role.dart';

/// Envoltorio delgado sobre Dio para /users. Sólo ADMIN puede llamar estos endpoints.
class UserApi {
  UserApi(this._dio);

  final Dio _dio;

  Future<List<CurrentUser>> list() async {
    try {
      final response = await _dio.get(ApiPaths.users);
      return (response.data as List)
          .map((json) => CurrentUser.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<CurrentUser> updateRole({
    required int userId,
    required UserRole role,
  }) async {
    try {
      final response = await _dio.patch(
        ApiPaths.userRole(userId),
        data: {'role': role.name},
      );
      return CurrentUser.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
