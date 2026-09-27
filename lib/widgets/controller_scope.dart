import 'package:flutter/widgets.dart';

/// Expone el controller de un shell de rol a sus pestañas y reconstruye a
/// quien lo lea con [of] cada vez que el controller notifica.
class ControllerScope<T extends Listenable> extends InheritedNotifier<T> {
  const ControllerScope({
    super.key,
    required T controller,
    required super.child,
  }) : super(notifier: controller);

  static T of<T extends Listenable>(BuildContext context) => context
      .dependOnInheritedWidgetOfExactType<ControllerScope<T>>()!
      .notifier!;

  /// Sin suscripción: para callbacks (onPressed) y `initState`.
  static T read<T extends Listenable>(BuildContext context) =>
      context.getInheritedWidgetOfExactType<ControllerScope<T>>()!.notifier!;
}
