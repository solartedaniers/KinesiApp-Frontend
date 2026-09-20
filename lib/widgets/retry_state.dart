import 'package:flutter/material.dart';

import '../core/localization/app_localizations.dart';

/// Estado de error genérico con botón de reintentar, reutilizado por las
/// listas de las home screens (athlete/coach/admin) cuando una carga falla.
class RetryState extends StatelessWidget {
  const RetryState({
    super.key,
    required this.messageKey,
    required this.onRetry,
  });

  final String messageKey;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Center(
    child: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(context.tr(messageKey)),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: onRetry,
          icon: const Icon(Icons.refresh),
          label: Text(context.tr('retry')),
        ),
      ],
    ),
  );
}
