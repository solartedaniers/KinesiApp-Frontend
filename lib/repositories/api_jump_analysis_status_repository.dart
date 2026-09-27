import '../models/jump_analysis/jump_analysis_status.dart';
import '../services/jump_analyses/jump_analysis_api.dart';
import 'jump_analysis_status_repository.dart';

/// Estado real del análisis vía `GET /jump-analyses/{id}`. El backend lo
/// procesa en segundo plano, así que mientras siga `pending` está en cola.
class ApiJumpAnalysisStatusRepository implements JumpAnalysisStatusRepository {
  const ApiJumpAnalysisStatusRepository(this._api);

  final JumpAnalysisApi _api;

  @override
  Future<ClientAnalysisStatus> getStatus(int analysisId) async =>
      switch ((await _api.get(analysisId)).status) {
        JumpAnalysisStatus.pending => ClientAnalysisStatus.queued,
        JumpAnalysisStatus.processed => ClientAnalysisStatus.processed,
        JumpAnalysisStatus.failed => ClientAnalysisStatus.failed,
      };
}
