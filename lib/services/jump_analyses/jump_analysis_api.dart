import 'package:dio/dio.dart';

import '../../core/network/api_exception.dart';
import '../../core/network/api_paths.dart';
import '../../models/jump_analysis/jump_analysis_summary.dart';

/// Envoltorio delgado sobre Dio para /jump-analyses.
class JumpAnalysisApi {
  JumpAnalysisApi(this._dio);

  final Dio _dio;

  Future<List<JumpAnalysisSummary>> listByAthlete(int athleteId) =>
      _list(ApiPaths.jumpAnalysesForAthlete(athleteId));

  /// Solo COACH: análisis de todos sus deportistas a cargo.
  Future<List<JumpAnalysisSummary>> listTeam() =>
      _list(ApiPaths.teamJumpAnalyses);

  Future<JumpAnalysisSummary> get(int analysisId) async {
    try {
      final response = await _dio.get(ApiPaths.jumpAnalysis(analysisId));
      return JumpAnalysisSummary.fromJson(
        response.data as Map<String, dynamic>,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<List<JumpAnalysisSummary>> _list(String path) async {
    try {
      final response = await _dio.get(path);
      return (response.data as List)
          .map(
            (json) =>
                JumpAnalysisSummary.fromJson(json as Map<String, dynamic>),
          )
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
