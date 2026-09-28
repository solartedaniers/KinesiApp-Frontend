import 'dart:async';

import 'package:cross_file/cross_file.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/controllers/video_recording_controller.dart';

// Cubre la lógica de la pantalla (guards, fases, timeout). El comportamiento
// del plugin nativo (eventos Start/Finalize de CameraX) sólo se ejercita en
// integration_test/video_capture_test.dart, sobre un emulador o dispositivo.

/// Cámara falsa: cada start/stop devuelve un future que el test resuelve.
class _FakeCamera {
  int starts = 0;
  int stops = 0;
  Completer<void> startCompleter = Completer();
  Completer<XFile> stopCompleter = Completer();

  Future<void> start() {
    starts++;
    return startCompleter.future;
  }

  Future<XFile> stop() {
    stops++;
    return stopCompleter.future;
  }
}

VideoRecordingController _controller(
  _FakeCamera camera, {
  Duration timeout = const Duration(seconds: 5),
}) => VideoRecordingController(
  start: camera.start,
  stop: camera.stop,
  timeout: timeout,
);

Future<void> _startRecording(
  _FakeCamera camera,
  VideoRecordingController controller,
) async {
  final started = controller.start();
  camera.startCompleter.complete();
  expect(await started, isTrue);
}

void main() {
  test(
    'a second stop while the first is finishing never reaches the plugin',
    () async {
      final camera = _FakeCamera();
      final controller = _controller(camera);
      await _startRecording(camera, controller);

      // Toque en "detener" + auto-stop del temporizador casi a la vez: antes
      // ambos llegaban al plugin y el segundo quedaba esperando para siempre
      final first = controller.stop();
      final second = controller.stop();
      expect(controller.phase, RecordingPhase.stopping);
      expect(await second, isNull);

      camera.stopCompleter.complete(XFile('/tmp/jump.mp4'));
      expect((await first)!.path, '/tmp/jump.mp4');
      expect(camera.stops, 1);
      expect(controller.phase, RecordingPhase.idle);
    },
  );

  test(
    'start cannot be triggered twice while the plugin is starting',
    () async {
      final camera = _FakeCamera();
      final controller = _controller(camera);

      final first = controller.start();
      expect(await controller.start(), isFalse);
      expect(controller.isBusy, isTrue);

      camera.startCompleter.complete();
      expect(await first, isTrue);
      expect(camera.starts, 1);
      expect(controller.phase, RecordingPhase.recording);
    },
  );

  test('stop is ignored when nothing is recording', () async {
    final camera = _FakeCamera();
    expect(await _controller(camera).stop(), isNull);
    expect(camera.stops, 0);
  });

  test('a stop that never resolves times out instead of freezing', () async {
    final camera = _FakeCamera();
    final controller = _controller(
      camera,
      timeout: const Duration(milliseconds: 50),
    );
    await _startRecording(camera, controller);

    // El stopCompleter nunca se completa: es el Finalize que no llega
    expect(await controller.stop(), isNull);
    expect(controller.phase, RecordingPhase.idle);
    expect(controller.error, isA<TimeoutException>());
  });

  test(
    'a plugin failure returns to idle with the error, ready to retry',
    () async {
      final camera = _FakeCamera();
      final controller = _controller(camera);
      await _startRecording(camera, controller);

      final stopped = controller.stop();
      camera.stopCompleter.completeError(StateError('camera failed'));
      expect(await stopped, isNull);
      expect(controller.phase, RecordingPhase.idle);
      expect(controller.error, isA<StateError>());

      // El siguiente intento limpia el error
      camera.startCompleter = Completer();
      await _startRecording(camera, controller);
      expect(controller.error, isNull);
    },
  );
}
