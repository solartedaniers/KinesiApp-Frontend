import 'package:flutter/material.dart' show ThemeMode;
import 'package:flutter/widgets.dart';

import '../core/localization/app_localizations.dart';
import '../services/athletes/athlete_api.dart';
import '../services/athletes/managed_athlete_api.dart';
import '../services/auth/session_controller.dart';
import '../services/jump_analyses/jump_analysis_api.dart';
import '../services/users/user_api.dart';
import '../repositories/jump_analysis_consent_repository.dart';
import '../repositories/video_upload_repository.dart';
import '../repositories/jump_analysis_status_repository.dart';
import '../repositories/chat_repository.dart';

/// Único InheritedWidget que expone las dependencias construidas por el
/// composition root (`KinesiApp`) al resto del árbol: nada por debajo crea
/// sus propias instancias de repositorios/servicios.
class AppScope extends InheritedWidget {
  const AppScope({
    super.key,
    required this.sessionController,
    required this.athleteApi,
    required this.managedAthleteApi,
    required this.userApi,
    required this.jumpAnalysisApi,
    required this.consentRepository,
    required this.videoUploadRepository,
    required this.analysisStatusRepository,
    required this.chatRepository,
    required this.language,
    required this.themeMode,
    required this.onLanguageChanged,
    required this.onThemeModeChanged,
    required super.child,
  });

  final SessionController sessionController;
  final AthleteApi athleteApi;
  final ManagedAthleteApi managedAthleteApi;
  final UserApi userApi;
  final JumpAnalysisApi jumpAnalysisApi;
  final JumpAnalysisConsentRepository consentRepository;
  final VideoUploadRepository videoUploadRepository;
  final JumpAnalysisStatusRepository analysisStatusRepository;
  final ChatRepository chatRepository;
  final AppLanguage language;
  final ThemeMode themeMode;
  final ValueChanged<AppLanguage> onLanguageChanged;
  final ValueChanged<ThemeMode> onThemeModeChanged;

  static AppScope of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<AppScope>()!;

  /// Acceso a servicios sin suscribirse a cambios de idioma/tema. Es el único
  /// válido dentro de `initState` (ahí `of` lanza en debug), así que los
  /// cargadores que arrancan en `initState` deben usar este.
  static AppScope read(BuildContext context) =>
      context.getInheritedWidgetOfExactType<AppScope>()!;

  @override
  bool updateShouldNotify(AppScope oldWidget) =>
      language != oldWidget.language || themeMode != oldWidget.themeMode;
}
