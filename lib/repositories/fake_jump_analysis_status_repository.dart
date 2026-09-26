import 'jump_analysis_status_repository.dart';

/// Implementación temporal, reemplazar cuando exista el endpoint real en docs/design/video-analysis-pipeline.md §10.3.
class FakeJumpAnalysisStatusRepository implements JumpAnalysisStatusRepository {
  final Map<int, int> _pollCounts = {};

  @override
  Future<ClientAnalysisStatus> getStatus(int analysisId) async {
    await Future<void>.delayed(const Duration(seconds: 2));
    final count = (_pollCounts[analysisId] ?? 0) + 1;
    _pollCounts[analysisId] = count;
    if (count == 1) return ClientAnalysisStatus.queued;
    if (count <= 3) return ClientAnalysisStatus.processing;
    return ClientAnalysisStatus.processed;
  }
}
