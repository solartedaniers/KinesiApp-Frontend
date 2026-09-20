import 'package:flutter/material.dart';

/// Paleta cruda de la marca. Ningún widget debe usar `Color(0x...)`: siempre
/// a través de esto (o mejor, del `ColorScheme`/`ThemeData` que construye).
abstract final class AppColors {
  static const Color cyan = Color(0xFF00CFE8);
  static const Color cyanDeep = Color(0xFF006D81);
  static const Color cyanLightPrimary = Color(0xFF84F4FF);
  static const Color mint = Color(0xFF4EDEA3);
  static const Color darkBackground = Color(0xFF0B1220);
  static const Color darkSurface = Color(0xFF151F2D);
  static const Color lightBackground = Color(0xFFF4F8FB);
}
