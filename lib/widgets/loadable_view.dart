import 'package:flutter/material.dart';

import '../controllers/loadable_controller.dart';
import 'retry_state.dart';

/// Pinta un [LoadableController]: cargando, reintento o el contenido con
/// "deslizar para refrescar" ([builder] debe devolver un scrollable).
class LoadableView<T> extends StatelessWidget {
  const LoadableView({
    super.key,
    required this.controller,
    required this.builder,
  });

  final LoadableController<T> controller;
  final Widget Function(BuildContext context, T data) builder;

  @override
  Widget build(BuildContext context) => ListenableBuilder(
    listenable: controller,
    builder: (context, _) {
      if (!controller.hasData) {
        return controller.hasError
            ? RetryState(messageKey: 'errorGeneric', onRetry: controller.load)
            : const Center(child: CircularProgressIndicator());
      }
      return RefreshIndicator(
        onRefresh: controller.load,
        child: builder(context, controller.data),
      );
    },
  );
}
