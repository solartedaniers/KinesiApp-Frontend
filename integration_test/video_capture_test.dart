import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/app/app_scope.dart';
import 'package:frontend/core/localization/app_localizations.dart';
import 'package:frontend/core/localization/translation_service.dart';
import 'package:frontend/core/navigation/analysis_flow.dart';
import 'package:frontend/core/navigation/app_routes.dart';
import 'package:frontend/repositories/chat_repository.dart';
import 'package:frontend/repositories/jump_analysis_consent_repository.dart';
import 'package:frontend/repositories/jump_analysis_status_repository.dart';
import 'package:frontend/repositories/video_upload_repository.dart';
import 'package:frontend/services/athletes/athlete_api.dart';
import 'package:frontend/services/athletes/managed_athlete_api.dart';
import 'package:frontend/services/auth/session_controller.dart';
import 'package:frontend/services/jump_analyses/jump_analysis_api.dart';
import 'package:frontend/services/users/user_api.dart';
import 'package:frontend/views/analysis/video_capture_view.dart';
import 'package:go_router/go_router.dart';
import 'package:integration_test/integration_test.dart';

// Corre sobre la cámara REAL del emulador/dispositivo (plugin camera nativo):
//   flutter test integration_test/video_capture_test.dart -d <device>
// El ciclo grabar → detener depende del plugin nativo (eventos Start/Finalize
// de CameraX), por eso no puede cubrirse con `flutter test` a secas.

class _AlwaysConsented implements JumpAnalysisConsentRepository {
  @override
  Future<bool> hasConsent(int version) async => true;

  @override
  Future<void> recordConsent(int version) async {}
}

class _UnusedSession extends Fake implements SessionController {}

class _UnusedAthleteApi extends Fake implements AthleteApi {}

class _UnusedManagedAthleteApi extends Fake implements ManagedAthleteApi {}

class _UnusedUserApi extends Fake implements UserApi {}

class _UnusedJumpAnalysisApi extends Fake implements JumpAnalysisApi {}

class _UnusedUpload extends Fake implements VideoUploadRepository {}

class _UnusedStatus extends Fake implements JumpAnalysisStatusRepository {}

class _UnusedChat extends Fake implements ChatRepository {}

/// Pantalla de captura real; la de subida es un marcador que registra el video.
Widget _app(List<AnalysisFlow> reachedUpload) => AppLocalizationScope(
  localizations: AppLocalizations(
    const TranslationCatalog(english: {}, spanish: {}),
    AppLanguage.spanish,
  ),
  child: AppScope(
    sessionController: _UnusedSession(),
    athleteApi: _UnusedAthleteApi(),
    managedAthleteApi: _UnusedManagedAthleteApi(),
    userApi: _UnusedUserApi(),
    jumpAnalysisApi: _UnusedJumpAnalysisApi(),
    consentRepository: _AlwaysConsented(),
    videoUploadRepository: _UnusedUpload(),
    analysisStatusRepository: _UnusedStatus(),
    chatRepository: _UnusedChat(),
    language: AppLanguage.spanish,
    themeMode: ThemeMode.light,
    onLanguageChanged: (_) {},
    onThemeModeChanged: (_) {},
    child: MaterialApp.router(
      routerConfig: GoRouter(
        routes: [
          GoRoute(
            path: '/',
            builder: (_, _) => const VideoCaptureView(athleteId: 1),
          ),
          GoRoute(
            path: AppRoutes.videoUpload,
            builder: (_, state) {
              reachedUpload.add(state.extra! as AnalysisFlow);
              return const Text('upload-reached');
            },
          ),
        ],
      ),
    ),
  ),
);

/// Espera (bombeando frames) hasta que [condition] se cumpla o venza [timeout].
Future<bool> _pumpUntil(
  WidgetTester tester,
  bool Function() condition, {
  Duration timeout = const Duration(seconds: 20),
}) async {
  final deadline = DateTime.now().add(timeout);
  while (DateTime.now().isBefore(deadline)) {
    await tester.pump(const Duration(milliseconds: 200));
    if (condition()) return true;
  }
  return false;
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  Future<void> startRecording(WidgetTester tester) async {
    expect(
      await _pumpUntil(
        tester,
        () => find.text('videoCaptureStart').evaluate().isNotEmpty,
      ),
      isTrue,
      reason: 'camera never initialized',
    );
    await tester.tap(find.text('videoCaptureStart'));
    expect(
      await _pumpUntil(
        tester,
        () => find.text('videoCaptureStop').evaluate().isNotEmpty,
      ),
      isTrue,
      reason: 'recording never started',
    );
    await tester.pump(const Duration(seconds: 2));
  }

  testWidgets('stopping a recording reaches the upload screen', (tester) async {
    final reached = <AnalysisFlow>[];
    await tester.pumpWidget(_app(reached));
    await startRecording(tester);

    await tester.tap(find.text('videoCaptureStop'));

    expect(
      await _pumpUntil(tester, () => reached.isNotEmpty),
      isTrue,
      reason: 'stop never completed (frozen)',
    );
    expect(await reached.single.video.length(), greaterThan(0));
  });

  testWidgets('tapping stop twice still reaches the upload screen once', (
    tester,
  ) async {
    final reached = <AnalysisFlow>[];
    await tester.pumpWidget(_app(reached));
    await startRecording(tester);

    await tester.tap(find.text('videoCaptureStop'));
    await tester.pump(const Duration(milliseconds: 50));
    // Un segundo toque mientras el primero espera a que el plugin finalice
    if (find.text('videoCaptureStop').evaluate().isNotEmpty) {
      await tester.tap(find.text('videoCaptureStop'), warnIfMissed: false);
    }

    expect(
      await _pumpUntil(tester, () => reached.isNotEmpty),
      isTrue,
      reason: 'double stop froze the screen',
    );
    await tester.pump(const Duration(seconds: 1));
    expect(reached, hasLength(1));
  });
}
