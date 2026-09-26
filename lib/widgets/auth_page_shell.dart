import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/localization/app_localizations.dart';
import '../core/navigation/app_routes.dart';
import '../core/theme/app_spacing.dart';
import 'app_card.dart';
import 'app_logo.dart';
import 'language_theme_toggle.dart';

class AuthPageShell extends StatelessWidget {
  const AuthPageShell({
    super.key,
    required this.titleKey,
    required this.subtitleKey,
    required this.content,
    this.footer,
    this.showBackButton = false,
  });

  final String titleKey;
  final String subtitleKey;
  final Widget content;
  final Widget? footer;
  final bool showBackButton;

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      leading: showBackButton
          ? IconButton(
              onPressed: () => context.canPop()
                  ? context.pop()
                  : context.go(AppRoutes.login),
              icon: const Icon(Icons.arrow_back),
              tooltip: context.tr('back'),
            )
          : null,
      actions: const [LanguageThemeToggle()],
    ),
    body: SafeArea(
      child: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: ConstrainedBox(
            constraints: const BoxConstraints(
              maxWidth: AppSpacing.maxContentWidth,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const AppLogo(),
                const SizedBox(height: AppSpacing.lg),
                Text(
                  context.tr('appName'),
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  context.tr(titleKey),
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  context.tr(subtitleKey),
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),
                AppCard(child: content),
                if (footer != null) ...[
                  const SizedBox(height: AppSpacing.md),
                  footer!,
                ],
              ],
            ),
          ),
        ),
      ),
    ),
  );
}
