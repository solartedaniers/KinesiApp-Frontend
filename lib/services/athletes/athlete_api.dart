import 'package:dio/dio.dart';

import '../../core/network/api_exception.dart';
import '../../core/network/api_paths.dart';
import '../../models/athlete/athlete_profile.dart';
import '../../models/athlete/athlete_profile_form_data.dart';

/// Envoltorio delgado sobre Dio para los endpoints /athletes del backend.
class AthleteApi {
  AthleteApi(this._dio);

  final Dio _dio;

  Future<AthleteProfile> getMine() => _send(() => _dio.get(ApiPaths.athleteMe));

  Future<AthleteProfile> createMine(AthleteProfileFormData data) =>
      _send(() => _dio.post(ApiPaths.athleteMe, data: data.toJson()));

  /// El propio deportista actualiza su ficha (p. ej. cambios de peso o altura).
  Future<AthleteProfile> updateMine(AthleteProfileFormData data) =>
      _send(() => _dio.patch(ApiPaths.athleteMe, data: data.toJson()));

  Future<List<AthleteProfile>> listCoached() => _list(ApiPaths.athletesCoached);

  /// Sólo ADMIN: alimenta la pantalla de asignación de coach.
  Future<List<AthleteProfile>> listAll() => _list(ApiPaths.athletes);

  Future<AthleteProfile> assignCoach({
    required int athleteId,
    required int coachId,
  }) => _send(
    () => _dio.patch(
      ApiPaths.athleteCoach(athleteId),
      data: {'coach_id': coachId},
    ),
  );

  Future<AthleteProfile> _send(Future<Response> Function() request) async {
    try {
      final response = await request();
      return AthleteProfile.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<List<AthleteProfile>> _list(String path) async {
    try {
      final response = await _dio.get(path);
      return (response.data as List)
          .map((json) => AthleteProfile.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
