import 'package:dio/dio.dart';

import '../../core/network/api_exception.dart';
import '../../core/network/api_paths.dart';
import '../../models/athlete/athlete_profile.dart';
import '../../models/athlete/athlete_profile_form_data.dart';

/// Envoltorio delgado sobre Dio para `/coach/athletes`: CRUD exclusivo del
/// coach sobre sus deportistas (lista todos los que tiene a cargo, pero solo
/// puede editar/borrar los gestionados sin cuenta propia).
class ManagedAthleteApi {
  ManagedAthleteApi(this._dio);

  final Dio _dio;

  Future<List<AthleteProfile>> list() async {
    try {
      final response = await _dio.get(ApiPaths.coachAthletes);
      return (response.data as List)
          .map((json) => AthleteProfile.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<AthleteProfile> create(AthleteProfileFormData data) =>
      _send(() => _dio.post(ApiPaths.coachAthletes, data: data.toJson()));

  Future<AthleteProfile> update(int athleteId, AthleteProfileFormData data) =>
      _send(
        () => _dio.patch(ApiPaths.coachAthlete(athleteId), data: data.toJson()),
      );

  Future<void> delete(int athleteId) async {
    try {
      await _dio.delete(ApiPaths.coachAthlete(athleteId));
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<AthleteProfile> _send(Future<Response> Function() request) async {
    try {
      final response = await request();
      return AthleteProfile.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
