import 'package:flutter/material.dart';

/// Fondo decorativo (grilla + halo) reutilizado en las pantallas de auth y home.
class BiometricBackground extends StatelessWidget {
  const BiometricBackground({super.key, required this.child, this.variant = 0});

  final Widget child;
  final int variant;

  @override
  Widget build(BuildContext context) => Stack(
    children: [
      Positioned.fill(
        child: CustomPaint(
          painter: _GridPainter(Theme.of(context).colorScheme.primary, variant),
        ),
      ),
      child,
    ],
  );
}

class _GridPainter extends CustomPainter {
  const _GridPainter(this.color, this.variant);

  final Color color;
  final int variant;

  static const double _cell = 32;
  static const double _haloOuterRadius = 86;
  static const double _haloInnerRadius = 48;

  @override
  void paint(Canvas canvas, Size size) {
    final line = Paint()..color = color.withValues(alpha: .1);
    for (var x = 0.0; x < size.width; x += _cell) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), line);
    }
    for (var y = 0.0; y < size.height; y += _cell) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), line);
    }
    final origin = Offset(
      size.width * (variant.isEven ? .72 : .28),
      size.height * .25,
    );
    canvas.drawCircle(
      origin,
      _haloOuterRadius,
      Paint()..color = color.withValues(alpha: .1),
    );
    canvas.drawCircle(
      origin,
      _haloInnerRadius,
      Paint()
        ..color = color.withValues(alpha: .5)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2,
    );
  }

  @override
  bool shouldRepaint(_GridPainter oldDelegate) =>
      oldDelegate.color != color || oldDelegate.variant != variant;
}
