import 'package:dio/dio.dart';

import '../../core/network/api_exception.dart';
import '../../core/network/api_paths.dart';
import '../../models/athlete/athlete_profile.dart';

/// Envoltorio delgado sobre Dio para los endpoints /athletes del backend.
class AthleteApi {
  AthleteApi(this._dio);

  final Dio _dio;

  Future<AthleteProfile> getMine() async {
    try {
      final response = await _dio.get(ApiPaths.athleteMe);
      return AthleteProfile.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<AthleteProfile> createMine({
    required String sport,
    required double heightCm,
    required double weightKg,
    required DateTime birthDate,
  }) async {
    try {
      final response = await _dio.post(
        ApiPaths.athleteMe,
        data: {
          'sport': sport,
          'height_cm': heightCm,
          'weight_kg': weightKg,
          'birth_date': _isoDate(birthDate),
        },
      );
      return AthleteProfile.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<List<AthleteProfile>> listCoached() => _list(ApiPaths.athletesCoached);

  /// Sólo ADMIN: alimenta la pantalla de asignación de coach.
  Future<List<AthleteProfile>> listAll() => _list(ApiPaths.athletes);

  Future<AthleteProfile> assignCoach({
    required int athleteId,
    required int coachId,
  }) async {
    try {
      final response = await _dio.patch(
        ApiPaths.athleteCoach(athleteId),
        data: {'coach_id': coachId},
      );
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

  String _isoDate(DateTime date) =>
      '${date.year.toString().padLeft(4, '0')}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
}
