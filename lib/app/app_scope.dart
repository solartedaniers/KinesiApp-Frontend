import 'package:flutter/material.dart' show ThemeMode;
import 'package:flutter/widgets.dart';

import '../core/localization/app_localizations.dart';
import '../services/athletes/athlete_api.dart';
import '../services/auth/session_controller.dart';
import '../services/jump_analyses/jump_analysis_api.dart';
import '../services/users/user_api.dart';

/// Único InheritedWidget que expone las dependencias construidas por el
/// composition root (`KinesiApp`) al resto del árbol: nada por debajo crea
/// sus propias instancias de repositorios/servicios.
class AppScope extends InheritedWidget {
  const AppScope({
    super.key,
    required this.sessionController,
    required this.athleteApi,
    required this.userApi,
    required this.jumpAnalysisApi,
    required this.language,
    required this.themeMode,
    required this.onLanguageChanged,
    required this.onThemeModeChanged,
    required super.child,
  });

  final SessionController sessionController;
  final AthleteApi athleteApi;
  final UserApi userApi;
  final JumpAnalysisApi jumpAnalysisApi;
  final AppLanguage language;
  final ThemeMode themeMode;
  final ValueChanged<AppLanguage> onLanguageChanged;
  final ValueChanged<ThemeMode> onThemeModeChanged;

  static AppScope of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<AppScope>()!;

  @override
  bool updateShouldNotify(AppScope oldWidget) =>
      language != oldWidget.language || themeMode != oldWidget.themeMode;
}
