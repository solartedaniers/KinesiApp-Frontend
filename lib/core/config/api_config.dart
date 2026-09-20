import 'dart:io' show Platform;

import 'package:flutter/foundation.dart' show kIsWeb;

/// Resuelve la URL base del backend según la plataforma de ejecución.
///
/// El emulador de Android no puede llegar a "localhost" (apunta a sí mismo, no al
/// host); 10.0.2.2 es el alias especial que el emulador expone hacia la máquina host.
class ApiConfig {
  const ApiConfig._();

  static const int _port = 8001;

  static String get baseUrl {
    if (kIsWeb) return 'http://localhost:$_port/api/v1';
    if (Platform.isAndroid) return 'http://10.0.2.2:$_port/api/v1';
    return 'http://localhost:$_port/api/v1'; // iOS/desktop: localhost sí resuelve al host
  }
}
