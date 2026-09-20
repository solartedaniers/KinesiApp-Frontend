import 'package:flutter/material.dart';
import '../core/localization/app_localizations.dart';
import '../core/localization/translation_service.dart';
import '../core/theme/app_theme.dart';
import '../views/auth/login_view.dart';
void runKinesiApp() => runApp(const KinesiApp());
class KinesiApp extends StatefulWidget { const KinesiApp({super.key}); @override State<KinesiApp> createState()=>_KinesiAppState(); }
class _KinesiAppState extends State<KinesiApp>{ final TranslationService _service=AssetTranslationService(); late final Future<TranslationCatalog> _catalog=_service.load(); AppLanguage _language=AppLanguage.spanish; ThemeMode _mode=ThemeMode.system; @override Widget build(BuildContext context)=>FutureBuilder<TranslationCatalog>(future:_catalog,builder:(context,snapshot){if(!snapshot.hasData)return const MaterialApp(home:Scaffold(body:Center(child:CircularProgressIndicator())));return AppLocalizationScope(localizations:AppLocalizations(snapshot.data!,_language),child:Builder(builder:(context)=>MaterialApp(debugShowCheckedModeBanner:false,title:context.tr('appName'),theme:AppTheme.light,darkTheme:AppTheme.dark,themeMode:_mode,home:LoginView(language:_language,themeMode:_mode,onLanguageChanged:(value)=>setState(()=>_language=value),onThemeModeChanged:(value)=>setState(()=>_mode=value)))));});}
