import 'package:flutter/material.dart';

import '../core/localization/app_localizations.dart';
import '../core/theme/app_spacing.dart';

/// Una métrica: icono, valor grande y etiqueta traducida.
class StatItem {
  const StatItem({
    required this.labelKey,
    required this.value,
    required this.icon,
  });

  final String labelKey;
  final String value;
  final IconData icon;
}

/// Tarjetas de métricas en dos columnas, pensadas para pantalla de móvil.
class StatGrid extends StatelessWidget {
  const StatGrid({super.key, required this.items});

  final List<StatItem> items;

  @override
  Widget build(BuildContext context) => GridView.count(
    crossAxisCount: 2,
    shrinkWrap: true,
    physics: const NeverScrollableScrollPhysics(),
    mainAxisSpacing: AppSpacing.sm + AppSpacing.xs,
    crossAxisSpacing: AppSpacing.sm + AppSpacing.xs,
    childAspectRatio: 1.3,
    children: [for (final item in items) _StatCard(item: item)],
  );
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.item});

  final StatItem item;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Icon(item.icon, color: theme.colorScheme.secondary),
            // Fechas largas se encogen en vez de desbordar la tarjeta
            FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: Text(
                item.value,
                style: theme.textTheme.headlineSmall?.copyWith(
                  color: theme.colorScheme.primary,
                ),
              ),
            ),
            Text(
              context.tr(item.labelKey),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.labelMedium,
            ),
          ],
        ),
      ),
    );
  }
}
