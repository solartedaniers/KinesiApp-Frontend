import 'package:flutter/material.dart';

import '../../app/app_scope.dart';
import '../../core/localization/app_localizations.dart';
import '../../widgets/primary_button.dart';

/// Se muestra mientras `SessionStatus` sigue en `unknown`: mientras
/// `restoreSession()` está en vuelo (spinner) o si falló por red
/// (reintentar, sin haber borrado los tokens guardados).
class SplashView extends StatelessWidget {
  const SplashView({super.key});

  @override
  Widget build(BuildContext context) {
    final session = AppScope.of(context).sessionController;
    return Scaffold(
      body: AnimatedBuilder(
        animation: session,
        builder: (context, _) => Center(
          child: session.hasRestoreError
              ? Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        context.tr('sessionRestoreError'),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      PrimaryButton(
                        label: context.tr('retry'),
                        icon: Icons.refresh,
                        onPressed: session.restoreSession,
                      ),
                    ],
                  ),
                )
              : const CircularProgressIndicator(),
        ),
      ),
    );
  }
}
