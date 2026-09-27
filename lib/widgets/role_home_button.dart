import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app/app_scope.dart';
import '../core/localization/app_localizations.dart';
import '../core/navigation/role_home_resolver.dart';

/// Salida del flujo de análisis (que navega con `go`, sin pila para volver):
/// lleva a la home del rol de la sesión actual.
class RoleHomeButton extends StatelessWidget {
  const RoleHomeButton({super.key});

  @override
  Widget build(BuildContext context) => IconButton(
    icon: const Icon(Icons.home_outlined),
    tooltip: context.tr('backToHome'),
    onPressed: () {
      final role = AppScope.read(context).sessionController.currentUser!.role;
      context.go(RoleHomeResolver.resolve(role));
    },
  );
}
