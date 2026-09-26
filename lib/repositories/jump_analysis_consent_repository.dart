abstract interface class JumpAnalysisConsentRepository {
  Future<bool> hasConsent(int version);
  Future<void> recordConsent(int version);
}
