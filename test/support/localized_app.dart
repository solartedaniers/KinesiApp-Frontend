import 'package:flutter/widgets.dart';
import 'package:frontend/core/localization/app_localizations.dart';
import 'package:frontend/core/localization/translation_service.dart';

/// Envuelve un widget con traducciones vacías: `tr(key)` devuelve la clave,
/// así los tests buscan textos por clave sin cargar los JSON.
Widget localized(Widget child) => AppLocalizationScope(
  localizations: AppLocalizations(
    const TranslationCatalog(english: {}, spanish: {}),
    AppLanguage.spanish,
  ),
  child: child,
);
