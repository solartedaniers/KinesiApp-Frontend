import 'dart:typed_data';

import 'package:flutter/material.dart';

/// Foto de perfil circular; sin foto muestra las iniciales del nombre.
class UserAvatar extends StatelessWidget {
  const UserAvatar({
    super.key,
    required this.name,
    this.bytes,
    this.radius = 22,
  });

  final String name;
  final Uint8List? bytes;
  final double radius;

  String get _initials => name
      .trim()
      .split(RegExp(r'\s+'))
      .where((part) => part.isNotEmpty)
      .take(2)
      .map((part) => part[0].toUpperCase())
      .join();

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final image = bytes;
    return CircleAvatar(
      radius: radius,
      backgroundColor: scheme.primaryContainer,
      foregroundColor: scheme.onPrimaryContainer,
      backgroundImage: image == null ? null : MemoryImage(image),
      child: image == null
          ? Text(
              _initials,
              style: TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: radius * 0.7,
              ),
            )
          : null,
    );
  }
}
