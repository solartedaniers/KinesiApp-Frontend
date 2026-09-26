import 'package:flutter/material.dart';

import '../core/theme/app_spacing.dart';

/// Botón de acción principal, con estado de carga incorporado para no
/// repetir el `isSubmitting ? spinner : botón` en cada pantalla.
class PrimaryButton extends StatelessWidget {
  const PrimaryButton({
    super.key,
    required this.label,
    required this.icon,
    required this.onPressed,
    this.isLoading = false,
  });

  final String label;
  final IconData icon;
  final VoidCallback? onPressed;
  final bool isLoading;

  @override
  Widget build(BuildContext context) => SizedBox(
    height: AppSpacing.actionHeight,
    width: double.infinity,
    child: FilledButton.icon(
      onPressed: isLoading ? null : onPressed,
      icon: isLoading
          ? SizedBox(
              width: AppSpacing.compactIcon,
              height: AppSpacing.compactIcon,
              child: CircularProgressIndicator(
                strokeWidth: AppSpacing.xs / 2,
                color: Theme.of(context).colorScheme.onPrimary,
              ),
            )
          : Icon(icon),
      label: Text(label),
    ),
  );
}
