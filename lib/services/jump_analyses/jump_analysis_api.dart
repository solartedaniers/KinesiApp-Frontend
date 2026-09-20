import 'package:dio/dio.dart';

import '../../core/network/api_exception.dart';
import '../../core/network/api_paths.dart';
import '../../models/jump_analysis/jump_analysis_summary.dart';

/// Envoltorio delgado sobre Dio para /jump-analyses.
class JumpAnalysisApi {
  JumpAnalysisApi(this._dio);

  final Dio _dio;

  Future<List<JumpAnalysisSummary>> listByAthlete(int athleteId) async {
    try {
      final response = await _dio.get(
        ApiPaths.jumpAnalysesForAthlete(athleteId),
      );
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
