import 'package:flutter/material.dart';

import '../../core/localization/app_localizations.dart';
import '../../core/theme/app_spacing.dart';

/// Mensaje de error de un intento de login/registro/OTP, ya traducido por
/// clave de i18n (nunca el `detail` en inglés que manda el backend).
class AuthErrorBanner extends StatelessWidget {
  const AuthErrorBanner({super.key, required this.messageKey});

  final String messageKey;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(top: AppSpacing.sm),
    child: Text(
      context.tr(messageKey),
      textAlign: TextAlign.center,
      style: TextStyle(color: Theme.of(context).colorScheme.error),
    ),
  );
}
