enum ClientAnalysisStatus { queued, processing, processed, failed }

abstract interface class JumpAnalysisStatusRepository {
  Future<ClientAnalysisStatus> getStatus(int analysisId);
}
