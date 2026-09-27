import 'package:flutter/material.dart';

/// Paleta cruda de la marca (identidad futbolera: césped, noche de estadio y
/// el dorado del trofeo). Ningún widget debe usar `Color(0x...)`: siempre a
/// través de esto (o mejor, del `ColorScheme`/`ThemeData` que construye).
abstract final class AppColors {
  static const Color pitchGreen = Color(0xFF1E8C4E);
  static const Color pitchGreenDeep = Color(0xFF136B3A);
  static const Color pitchGreenBright = Color(0xFF5BE38F);
  static const Color trophyGold = Color(0xFFF2B705);
  static const Color stadiumNight = Color(0xFF0A1622);
  static const Color stadiumNightSurface = Color(0xFF132433);
  static const Color chalkWhite = Color(0xFFF3F7F4);
}
