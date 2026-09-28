import 'package:flutter/foundation.dart';

/// URL base del backend. Viene siempre de `--dart-define-from-file=env/<archivo>.json`
/// (ver env/dev.local.json, env/dev.android.json, env/prod.example.json); nunca hay
/// un host o puerto quemado en el código.
abstract final class ApiConfig {
  static const String _baseUrl = String.fromEnvironment('API_BASE_URL');
  static const int maxVideoDurationSeconds = int.fromEnvironment(
    'MAX_VIDEO_DURATION_SECONDS',
    defaultValue: 30,
  );
  static const int videoCaptureFps = int.fromEnvironment(
    'VIDEO_CAPTURE_FPS',
    defaultValue: 24,
  );
  static const int videoCaptureBitrate = int.fromEnvironment(
    'VIDEO_CAPTURE_BITRATE',
    defaultValue: 2000000,
  );

  /// Tope para que el plugin de cámara inicie o finalice una grabación: si no
  /// responde, la pantalla se recupera en vez de quedar colgada.
  static const int videoRecordingTimeoutSeconds = int.fromEnvironment(
    'VIDEO_RECORDING_TIMEOUT_SECONDS',
    defaultValue: 15,
  );
  static const int consentVersion = int.fromEnvironment(
    'VIDEO_CONSENT_VERSION',
    defaultValue: 1,
  );

  static String get baseUrl {
    if (_baseUrl.isEmpty) {
      throw StateError(
        'API_BASE_URL is not set. Run with --dart-define-from-file=env/<file>.json, '
        'e.g. flutter run --dart-define-from-file=env/dev.local.json',
      );
    }
    // ponytail: única regla de seguridad de red que vive en Dart; el resto (cleartext
    // sólo en debug) lo impone la network security config nativa de Android.
    if (kReleaseMode && !_baseUrl.startsWith('https://')) {
      throw StateError('API_BASE_URL must use https:// in release builds.');
    }
    return _baseUrl;
  }
}
