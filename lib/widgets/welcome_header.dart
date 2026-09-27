import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../app/app_scope.dart';
import '../core/localization/app_localizations.dart';
import '../core/theme/app_spacing.dart';
import 'user_avatar.dart';

/// Cabecera de la pestaña Inicio de cada rol: avatar, saludo y una línea de
/// contexto sobre fondo verde "cancha". Escucha la sesión: un cambio de foto
/// o nombre se ve al instante sin recargar la pestaña.
class WelcomeHeader extends StatelessWidget {
  const WelcomeHeader({super.key, required this.hintKey});

  final String hintKey;

  @override
  Widget build(BuildContext context) {
    final session = AppScope.of(context).sessionController;
    return ListenableBuilder(
      listenable: session,
      builder: (context, _) {
        final user = session.currentUser;
        return user == null
            ? const SizedBox.shrink()
            : _content(context, user.fullName, user.avatarBytes);
      },
    );
  }

  Widget _content(BuildContext context, String name, Uint8List? avatarBytes) {
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
