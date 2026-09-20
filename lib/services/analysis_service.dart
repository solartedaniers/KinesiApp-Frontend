abstract interface class AnalysisService { Future<void> analyze(String videoReference); }
class PreviewAnalysisService implements AnalysisService { @override Future<void> analyze(String videoReference) async {} }
