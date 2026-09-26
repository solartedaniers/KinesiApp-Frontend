import 'package:flutter/material.dart';

import '../core/theme/app_spacing.dart';

/// Marca de KinesiApp usada en las pantallas de auth.
class AppLogo extends StatelessWidget {
  const AppLogo({super.key});

  @override
  Widget build(BuildContext context) => Center(
    child: Container(
      width: AppSpacing.brandMark,
      height: AppSpacing.brandMark,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppSpacing.md),
        color: Theme.of(context).colorScheme.surface,
        border: Border.all(color: Theme.of(context).colorScheme.primary),
      ),
      child: Icon(
        Icons.accessibility_new,
        color: Theme.of(context).colorScheme.primary,
        size: AppSpacing.brandIcon,
      ),
    ),
  );
}
