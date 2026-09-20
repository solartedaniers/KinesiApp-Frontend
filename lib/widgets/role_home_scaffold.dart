import 'package:flutter/material.dart';

import '../app/app_scope.dart';
import '../core/localization/app_localizations.dart';
import 'language_theme_toggle.dart';

/// Estructura común de las tres home screens (athlete/coach/admin): título,
/// toggle de idioma/tema y logout. Cada rol sólo aporta su `body`.
class RoleHomeScaffold extends StatelessWidget {
  const RoleHomeScaffold({
    super.key,
    required this.titleKey,
    required this.body,
    this.bottom,
  });

  final String titleKey;
  final Widget body;
  final PreferredSizeWidget? bottom;

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text(context.tr(titleKey)),
      bottom: bottom,
      actions: [
        const LanguageThemeToggle(),
        IconButton(
          onPressed: () => AppScope.of(context).sessionController.logout(),
          icon: const Icon(Icons.logout),
          tooltip: context.tr('logout'),
        ),
      ],
    ),
    body: SafeArea(child: body),
  );
}
