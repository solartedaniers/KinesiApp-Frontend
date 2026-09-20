import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/localization/app_localizations.dart';
import '../core/localization/translation_service.dart';
import '../core/network/api_client.dart';
import '../core/storage/secure_session_storage.dart';
import '../core/theme/app_theme.dart';
import '../repositories/auth_repository.dart';
import '../repositories/auth_repository_impl.dart';
import '../services/athletes/athlete_api.dart';
import '../services/auth/auth_api.dart';
import '../services/auth/session_controller.dart';
import '../services/jump_analyses/jump_analysis_api.dart';
import '../services/users/user_api.dart';
import '../use_cases/auth/login_use_case.dart';
import '../use_cases/auth/logout_use_case.dart';
import '../use_cases/auth/register_use_case.dart';
import '../use_cases/auth/restore_session_use_case.dart';
import '../use_cases/auth/verify_email_use_case.dart';
import 'app_scope.dart';
import 'router.dart';

void runKinesiApp() => runApp(const KinesiApp());

/// Composition root de la app: construye cada dependencia una sola vez y las
/// expone hacia abajo vía [AppScope]/[AppLocalizationScope]. Nada por debajo
/// instancia su propio Dio, repositorio o servicio.
class KinesiApp extends StatefulWidget {
  const KinesiApp({super.key});

  @override
  State<KinesiApp> createState() => _KinesiAppState();
}

class _KinesiAppState extends State<KinesiApp> {
  final TranslationService _translationService = AssetTranslationService();
  final SecureSessionStorage _storage = SecureSessionStorage();

  // El Dio "autenticado" necesita poder avisar cuando un refresh falla, y
  // SessionController necesita ese mismo Dio (vía AuthApi) para operar: se
  // resuelve con un callback perezoso, sin que ninguno de los dos se
  // construya sincrónicamente antes que el otro.
  late final Dio _dio = ApiClient.create(
    _storage,
    onSessionExpired: () async => _session.expireSession(),
  );
  late final AuthApi _authApi = AuthApi(_dio);
  late final AuthRepository _authRepository = AuthRepositoryImpl(
    _authApi,
    _storage,
  );
  late final SessionController _session = SessionController(
    login: LoginUseCase(_authRepository),
    register: RegisterUseCase(_authRepository),
    verifyEmail: VerifyEmailUseCase(_authRepository),
    logout: LogoutUseCase(_authRepository),
    restoreSession: RestoreSessionUseCase(_authRepository),
  );
  late final AthleteApi _athleteApi = AthleteApi(_dio);
  late final UserApi _userApi = UserApi(_dio);
  late final JumpAnalysisApi _jumpAnalysisApi = JumpAnalysisApi(_dio);
  late final GoRouter _router = buildAppRouter(_session);
  late final Future<TranslationCatalog> _bootstrap = _translationService.load();

  AppLanguage _language = AppLanguage.spanish;
  ThemeMode _mode = ThemeMode.system;

  @override
  void initState() {
    super.initState();
    // No se espera: el router muestra un splash con reintento mientras
    // status sigue en `unknown` (ver SplashView / buildAppRouter).
    unawaited(_session.restoreSession());
  }

  @override
  Widget build(BuildContext context) => FutureBuilder<TranslationCatalog>(
    future: _bootstrap,
    builder: (context, snapshot) {
      if (!snapshot.hasData) {
        return const MaterialApp(
          home: Scaffold(body: Center(child: CircularProgressIndicator())),
        );
      }
      return AppLocalizationScope(
        localizations: AppLocalizations(snapshot.data!, _language),
        child: AppScope(
          sessionController: _session,
          athleteApi: _athleteApi,
          userApi: _userApi,
          jumpAnalysisApi: _jumpAnalysisApi,
          language: _language,
          themeMode: _mode,
          onLanguageChanged: (value) => setState(() => _language = value),
          onThemeModeChanged: (value) => setState(() => _mode = value),
          child: Builder(
            builder: (context) => MaterialApp.router(
              debugShowCheckedModeBanner: false,
              title: context.tr('appName'),
              theme: AppTheme.light,
              darkTheme: AppTheme.dark,
              themeMode: _mode,
              routerConfig: _router,
            ),
          ),
        ),
      );
    },
  );
}
