import 'package:flutter/material.dart';

import '../core/localization/app_localizations.dart';
import '../core/theme/app_spacing.dart';

/// Una métrica: icono, valor grande y etiqueta traducida.
class StatItem {
  const StatItem({
    required this.labelKey,
    required this.value,
    required this.icon,
    this.onTap,
  });

  final String labelKey;
  final String value;
  final IconData icon;

  /// Si no es null, la tarjeta se puede tocar (p. ej. abrir las grabaciones).
  final VoidCallback? onTap;
}

/// Tarjetas de métricas en dos columnas, pensadas para pantalla de móvil.
/// La altura la da el contenido (no un aspect ratio fijo): con pantallas
/// angostas o texto del sistema agrandado la tarjeta crece en vez de
/// desbordar ("BOTTOM OVERFLOWED").
class StatGrid extends StatelessWidget {
  const StatGrid({super.key, required this.items});

  static const double _gap = AppSpacing.sm + AppSpacing.xs;

  final List<StatItem> items;

  @override
  Widget build(BuildContext context) => Column(
    children: [
      for (var i = 0; i < items.length; i += 2)
        Padding(
          padding: EdgeInsets.only(top: i == 0 ? 0 : _gap),
          // IntrinsicHeight: las dos tarjetas de la fila miden lo mismo
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(child: _StatCard(item: items[i])),
                const SizedBox(width: _gap),
                Expanded(
                  child: i + 1 < items.length
                      ? _StatCard(item: items[i + 1])
                      : const SizedBox.shrink(),
                ),
              ],
            ),
          ),
        ),
    ],
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
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: item.onTap,
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(item.icon, color: theme.colorScheme.secondary),
              const SizedBox(height: AppSpacing.sm),
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
      ),
    );
  }
}
