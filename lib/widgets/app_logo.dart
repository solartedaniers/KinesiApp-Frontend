import 'package:flutter/material.dart';

/// Marca de KinesiApp usada en las pantallas de auth.
class AppLogo extends StatelessWidget {
  const AppLogo({super.key});

  static const double _size = 64;

  @override
  Widget build(BuildContext context) => Center(
    child: Container(
      width: _size,
      height: _size,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        color: Theme.of(context).colorScheme.surface,
        border: Border.all(color: Theme.of(context).colorScheme.primary),
      ),
      child: Icon(
        Icons.accessibility_new,
        color: Theme.of(context).colorScheme.primary,
        size: 36,
      ),
    ),
  );
}
