import 'jump_analysis_consent_repository.dart';

/// Implementación temporal, reemplazar cuando exista el endpoint real en docs/design/video-analysis-pipeline.md §10.3.
class FakeJumpAnalysisConsentRepository
    implements JumpAnalysisConsentRepository {
  int? _acceptedVersion;

  @override
  Future<bool> hasConsent(int version) async => _acceptedVersion == version;

  @override
  Future<void> recordConsent(int version) async {
    _acceptedVersion = version;
  }
}
