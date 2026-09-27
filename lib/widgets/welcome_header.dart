import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../core/localization/app_localizations.dart';
import '../core/theme/app_spacing.dart';
import 'user_avatar.dart';

/// Cabecera de la pestaña Inicio de cada rol: avatar, saludo y una línea de
/// contexto sobre fondo verde "cancha".
class WelcomeHeader extends StatelessWidget {
  const WelcomeHeader({
    super.key,
    required this.name,
    required this.avatarBytes,
    required this.hintKey,
  });

  final String name;
  final Uint8List? avatarBytes;
  final String hintKey;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final onPrimary = theme.colorScheme.onPrimary;
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.panel),
        gradient: LinearGradient(
          colors: [theme.colorScheme.primary, theme.colorScheme.tertiary],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Row(
        children: [
          UserAvatar(name: name, bytes: avatarBytes, radius: 28),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${context.tr('homeGreeting')} ${name.split(' ').first}',
                  style: theme.textTheme.titleLarge?.copyWith(color: onPrimary),
                ),
                Text(
                  context.tr(hintKey),
                  style: theme.textTheme.bodyMedium?.copyWith(color: onPrimary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
