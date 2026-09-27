import 'package:flutter/material.dart';

import '../core/theme/app_spacing.dart';

/// Contenedor con estilo de tarjeta consistente para agrupar contenido; forma,
/// borde y margen salen del `cardTheme` de [AppTheme].
class AppCard extends StatelessWidget {
  const AppCard({super.key, required this.child, this.onTap});

  final Widget child;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) => Card(
    clipBehavior: Clip.antiAlias,
    child: InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: child,
      ),
    ),
  );
}
