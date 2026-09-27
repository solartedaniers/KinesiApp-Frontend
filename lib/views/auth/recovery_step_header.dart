import 'package:flutter/material.dart';

import '../../core/localization/app_localizations.dart';
import '../../core/theme/app_spacing.dart';

/// Progreso del flujo de recuperación: "Paso N de 3" con barra de avance.
class RecoveryStepHeader extends StatelessWidget {
  const RecoveryStepHeader({super.key, required this.step});

  static const int totalSteps = 3;
  static const List<String> _labelKeys = [
    'recoveryStepEmail',
    'recoveryStepCode',
    'recoveryStepPassword',
  ];

  /// 1..[totalSteps]
  final int step;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: AppSpacing.lg),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          context.tr(_labelKeys[step - 1]),
          style: Theme.of(context).textTheme.labelLarge,
        ),
        const SizedBox(height: AppSpacing.sm),
        LinearProgressIndicator(
          value: step / totalSteps,
          borderRadius: BorderRadius.circular(AppSpacing.xs),
        ),
      ],
    ),
  );
}
