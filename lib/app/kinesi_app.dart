import 'package:flutter/material.dart';
import '../core/localization/app_localizations.dart';
import '../core/localization/translation_service.dart';
import '../core/network/api_client.dart';
import '../core/storage/secure_session_storage.dart';
import '../core/theme/app_theme.dart';
import '../models/user_role.dart';
import '../services/auth/auth_api.dart';
import '../services/auth/session_controller.dart';
import '../views/auth/login_view.dart';
import '../views/dashboard/dashboard_view.dart';
void runKinesiApp() => runApp(const KinesiApp());
class KinesiApp extends StatefulWidget { const KinesiApp({super.key}); @override State<KinesiApp> createState()=>_KinesiAppState(); }
class _KinesiAppState extends State<KinesiApp> {
  final TranslationService _service = AssetTranslationService();

  // Sesión persistida en almacenamiento seguro y su cliente HTTP autenticado;
  // se construyen una sola vez y se restauran al arrancar (ver _bootstrap).
  final SecureSessionStorage _storage = SecureSessionStorage();
  late final SessionController _session = SessionController(AuthApi(ApiClient.create(_storage)), _storage);
  late final Future<TranslationCatalog> _bootstrap = _bootstrapApp();

  AppLanguage _language = AppLanguage.spanish;
  ThemeMode _mode = ThemeMode.system;

  // Carga las traducciones y restaura la sesión guardada en paralelo antes de mostrar la UI.
  Future<TranslationCatalog> _bootstrapApp() async {
    final catalog = _service.load();
    await _session.restoreSession();
    return catalog;
  }

  @override
  Widget build(BuildContext context) => FutureBuilder<TranslationCatalog>(
        future: _bootstrap,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const MaterialApp(home: Scaffold(body: Center(child: CircularProgressIndicator())));
          }
          final catalog = snapshot.data!;
          return AppLocalizationScope(
            localizations: AppLocalizations(catalog, _language),
            child: Builder(
              builder: (context) => MaterialApp(
                debugShowCheckedModeBanner: false,
                title: context.tr('appName'),
                theme: AppTheme.light,
                darkTheme: AppTheme.dark,
                themeMode: _mode,
                // Si restoreSession() encontró un token válido, se salta el login.
                home: _session.isAuthenticated
                    ? DashboardView(
                        role: _session.role ?? UserRole.athlete,
                        language: _language,
                        themeMode: _mode,
                        onLanguageChanged: (value) => setState(() => _language = value),
                        onThemeModeChanged: (value) => setState(() => _mode = value),
                      )
                    : LoginView(
                        session: _session,
                        language: _language,
                        themeMode: _mode,
                        onLanguageChanged: (value) => setState(() => _language = value),
                        onThemeModeChanged: (value) => setState(() => _mode = value),
                      ),
              ),
            ),
          );
        },
      );
}
