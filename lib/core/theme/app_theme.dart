import 'package:flutter/material.dart';

import 'app_colors.dart';
import 'app_spacing.dart';

/// Único punto que produce los `ThemeData` claro/oscuro de la app: todo color
/// vive aquí o en [AppColors], nunca suelto en un widget.
abstract final class AppTheme {
  static final ThemeData light = _build(Brightness.light);
  static final ThemeData dark = _build(Brightness.dark);

  static ThemeData _build(Brightness brightness) {
    final isDark = brightness == Brightness.dark;
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.cyan,
      brightness: brightness,
      primary: isDark ? AppColors.cyanLightPrimary : AppColors.cyanDeep,
      secondary: AppColors.mint,
      surface: isDark ? AppColors.darkSurface : Colors.white,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: isDark
          ? AppColors.darkBackground
          : AppColors.lightBackground,
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: scheme.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.control),
        ),
      ),
    );
  }
}
