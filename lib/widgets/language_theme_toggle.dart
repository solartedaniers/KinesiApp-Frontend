import 'package:flutter/material.dart';

import '../app/app_scope.dart';
import '../core/localization/app_localizations.dart';

/// Par de botones para alternar idioma/tema, leyendo y escribiendo el estado
/// compartido en [AppScope] (así cualquier pantalla puede montarlo sin recibir callbacks propios).
class LanguageThemeToggle extends StatelessWidget {
  const LanguageThemeToggle({super.key});

  @override
  Widget build(BuildContext context) {
    final scope = AppScope.of(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          onPressed: () => scope.onThemeModeChanged(
            scope.themeMode == ThemeMode.dark
                ? ThemeMode.light
                : ThemeMode.dark,
          ),
          icon: const Icon(Icons.dark_mode_outlined),
        ),
        IconButton(
          onPressed: () => scope.onLanguageChanged(
            scope.language == AppLanguage.spanish
                ? AppLanguage.english
                : AppLanguage.spanish,
          ),
          icon: const Icon(Icons.language),
        ),
      ],
    );
  }
}
