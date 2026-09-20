/// Espejo de `JumpAnalysisStatus` del backend (`app/models/jump_analysis.py`).
enum JumpAnalysisStatus {
  pending,
  processed,
  failed;

  static JumpAnalysisStatus fromApiValue(String value) =>
      JumpAnalysisStatus.values.firstWhere(
        (s) => s.name == value,
        orElse: () => JumpAnalysisStatus.pending,
      );
}
