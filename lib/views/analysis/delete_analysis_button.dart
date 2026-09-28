import 'package:flutter/material.dart';

import '../../core/error/error_message_resolver.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/network/api_exception.dart';

/// Acción "eliminar grabación": pide confirmación explícita (es irreversible:
/// se borran el video y sus mediciones) y sólo entonces llama a [delete].
class DeleteAnalysisButton extends StatefulWidget {
  const DeleteAnalysisButton({
    super.key,
    required this.delete,
    required this.onDeleted,
  });

  final Future<void> Function() delete;
  final VoidCallback onDeleted;

  @override
  State<DeleteAnalysisButton> createState() => _DeleteAnalysisButtonState();
}

class _DeleteAnalysisButtonState extends State<DeleteAnalysisButton> {
  bool _isDeleting = false;

  Future<bool> _confirm() async =>
      await showDialog<bool>(
        context: context,
        builder: (dialogContext) => AlertDialog(
          title: Text(context.tr('deleteAnalysisTitle')),
          content: Text(context.tr('deleteAnalysisMessage')),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: Text(context.tr('cancel')),
            ),
            FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.error,
                foregroundColor: Theme.of(context).colorScheme.onError,
              ),
              onPressed: () => Navigator.of(dialogContext).pop(true),
              child: Text(context.tr('delete')),
            ),
          ],
        ),
      ) ??
      false;

  Future<void> _onPressed() async {
    if (!await _confirm() || !mounted) return;
    final messenger = ScaffoldMessenger.of(context);
    setState(() => _isDeleting = true);
    try {
      await widget.delete();
      if (mounted) widget.onDeleted();
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _isDeleting = false);
      messenger.showSnackBar(
        SnackBar(
          content: Text(context.tr(ErrorMessageResolver.keyFor(e.code))),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) => IconButton(
    onPressed: _isDeleting ? null : _onPressed,
    tooltip: context.tr('deleteAnalysis'),
    icon: const Icon(Icons.delete_outline),
  );
}
