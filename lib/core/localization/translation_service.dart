import 'dart:convert';
import 'package:flutter/services.dart';
import 'app_localizations.dart';
abstract interface class TranslationService { Future<TranslationCatalog> load(); }
class AssetTranslationService implements TranslationService { @override Future<TranslationCatalog> load() async=>TranslationCatalog(english:await _read('lib/l10n/en.json'),spanish:await _read('lib/l10n/es.json')); Future<Map<String,String>> _read(String path) async=>Map<String,String>.from(jsonDecode(await rootBundle.loadString(path)) as Map); }
class TranslationCatalog { const TranslationCatalog({required this.english,required this.spanish}); final Map<String,String> english,spanish; String value(AppLanguage language,String key)=>(language==AppLanguage.english?english:spanish)[key]??english[key]??key; }
