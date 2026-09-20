import 'package:flutter/widgets.dart';
import 'translation_service.dart';
enum AppLanguage { english, spanish }
class AppLocalizations { const AppLocalizations(this.catalog,this.language); final TranslationCatalog catalog; final AppLanguage language; String translate(String key)=>catalog.value(language,key); }
class AppLocalizationScope extends InheritedWidget { const AppLocalizationScope({super.key,required this.localizations,required super.child}); final AppLocalizations localizations; @override bool updateShouldNotify(AppLocalizationScope old)=>localizations.language!=old.localizations.language; }
extension LocalizationContext on BuildContext { String tr(String key)=>dependOnInheritedWidgetOfExactType<AppLocalizationScope>()!.localizations.translate(key); }
