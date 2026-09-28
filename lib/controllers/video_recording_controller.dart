import 'package:cross_file/cross_file.dart';
import 'package:flutter/foundation.dart';

enum RecordingPhase { idle, starting, recording, stopping }

/// Ciclo de vida de una grabación, independiente del plugin de cámara (recibe
/// cómo iniciar y detener). Garantiza que cada operación nativa se pida una
/// sola vez aunque lleguen toques repetidos o el auto-stop del temporizador,
/// y que ningún future del plugin deje la pantalla colgada para siempre.
///
/// Por qué importa: en Android (camera_android_camerax) start y stop esperan
/// sus eventos Start/Finalize en una cola compartida por toda la app. Un stop
/// duplicado deja un waiter huérfano en esa cola que después se "come" el
/// Finalize de otra grabación, y ese stop no vuelve nunca.
class VideoRecordingController extends ChangeNotifier {
  VideoRecordingController({
    required Future<void> Function() start,
    required Future<XFile> Function() stop,
    required Duration timeout,
  }) : _start = start,
       _stop = stop,
       _timeout = timeout;

  final Future<void> Function() _start;
  final Future<XFile> Function() _stop;
  final Duration _timeout;

  RecordingPhase _phase = RecordingPhase.idle;
  Object? _error;

  RecordingPhase get phase => _phase;

  /// Último fallo de start/stop (incluido un timeout); se limpia al reintentar.
  Object? get error => _error;

  bool get isBusy =>
      _phase == RecordingPhase.starting || _phase == RecordingPhase.stopping;

  /// true si la grabación quedó en curso.
  Future<bool> start() async {
    if (_phase != RecordingPhase.idle) return false;
    _setPhase(RecordingPhase.starting, error: null);
    try {
      await _start().timeout(_timeout);
      _setPhase(RecordingPhase.recording);
      return true;
    } catch (error) {
      _setPhase(RecordingPhase.idle, error: error);
      return false;
    }
  }

  /// El video grabado, o null si no había una grabación en curso (p. ej. un
  /// segundo toque mientras ya se detiene) o si el plugin falló.
  Future<XFile?> stop() async {
    // El cambio de fase es síncrono, antes de cualquier await: un segundo
    // llamado (toque doble, temporizador) ya no pasa este guard
    if (_phase != RecordingPhase.recording) return null;
    _setPhase(RecordingPhase.stopping);
    try {
      final video = await _stop().timeout(_timeout);
      _setPhase(RecordingPhase.idle);
      return video;
    } catch (error) {
      _setPhase(RecordingPhase.idle, error: error);
      return null;
    }
  }

  void _setPhase(RecordingPhase phase, {Object? error = _keepError}) {
    _phase = phase;
    if (!identical(error, _keepError)) _error = error;
    notifyListeners();
  }

  static const Object _keepError = Object();
}
