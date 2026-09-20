import 'package:flutter/foundation.dart';

/// URL base del backend. Viene siempre de `--dart-define-from-file=env/<archivo>.json`
/// (ver env/dev.local.json, env/dev.android.json, env/prod.example.json); nunca hay
/// un host o puerto quemado en el código.
abstract final class ApiConfig {
  static const String _baseUrl = String.fromEnvironment('API_BASE_URL');

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
