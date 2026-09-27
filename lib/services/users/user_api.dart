import 'package:dio/dio.dart';

import '../../core/network/api_exception.dart';
import '../../core/network/api_paths.dart';
import '../../models/auth/current_user.dart';
import '../../models/avatar/avatar_data.dart';
import '../../models/user_role.dart';

/// Envoltorio delgado sobre Dio para /users. `list`/`updateRole` son de ADMIN;
/// los de `/users/me` los usa cualquier rol sobre su propia cuenta.
class UserApi {
  UserApi(this._dio);

  final Dio _dio;

  Future<CurrentUser> updateMyProfile({required String fullName}) => _sendMe(
    () => _dio.patch(ApiPaths.myProfile, data: {'full_name': fullName}),
  );

  Future<CurrentUser> uploadMyAvatar(AvatarUpload avatar) =>
      _sendMe(() => _dio.put(ApiPaths.myAvatar, data: avatar.toJson()));

  Future<CurrentUser> deleteMyAvatar() =>
      _sendMe(() => _dio.delete(ApiPaths.myAvatar));

  Future<CurrentUser> grantVideoConsent(int version) => _sendMe(
    () => _dio.post(ApiPaths.videoConsent, data: {'version': version}),
  );

  Future<CurrentUser> _sendMe(Future<Response> Function() request) async {
    try {
      final response = await request();
      return CurrentUser.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

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
