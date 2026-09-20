import 'package:flutter/material.dart';

import '../../core/localization/app_localizations.dart';
import '../../models/athlete/athlete_profile.dart';
import '../../widgets/app_card.dart';

/// Resumen del perfil real del deportista (sin datos de ejemplo): deporte,
/// altura, peso y fecha de nacimiento tal como los devuelve `GET /athletes/me`.
class AthleteProfileSummary extends StatelessWidget {
  const AthleteProfileSummary({super.key, required this.profile});

  final AthleteProfile profile;

  @override
  Widget build(BuildContext context) => AppCard(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          profile.sport,
          style: Theme.of(
            context,
          ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        _SummaryRow(
          icon: Icons.height,
          label: context.tr('heightCm'),
          value: profile.heightCm.toStringAsFixed(1),
        ),
        _SummaryRow(
          icon: Icons.monitor_weight_outlined,
          label: context.tr('weightKg'),
          value: profile.weightKg.toStringAsFixed(1),
        ),
        _SummaryRow(
          icon: Icons.cake_outlined,
          label: context.tr('birthDate'),
          value: profile.birthDate.toIso8601String().split('T').first,
        ),
      ],
    ),
  );
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 4),
    child: Row(
      children: [
        Icon(icon, size: 18),
        const SizedBox(width: 8),
        Expanded(child: Text(label)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
      ],
    ),
  );
}
