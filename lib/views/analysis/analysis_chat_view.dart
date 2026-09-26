import 'package:flutter/material.dart';

import '../../app/app_scope.dart';
import '../../core/localization/app_localizations.dart';
import '../../repositories/chat_repository.dart';
import '../../core/theme/app_spacing.dart';
import '../../widgets/app_card.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/retry_state.dart';

class AnalysisChatView extends StatefulWidget {
  const AnalysisChatView({super.key, required this.analysisId});
  final int analysisId;
  @override
  State<AnalysisChatView> createState() => _AnalysisChatViewState();
}

class _AnalysisChatViewState extends State<AnalysisChatView> {
  final TextEditingController _input = TextEditingController();
  late Future<List<ChatMessage>> _messages;
  final List<ChatMessage> _sent = [];
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    _messages = _load();
  }

  Future<List<ChatMessage>> _load() =>
      AppScope.of(context).chatRepository.getMessages(widget.analysisId);

  Future<void> _send() async {
    final content = _input.text.trim();
    if (content.isEmpty || _sending) return;
    setState(() {
      _sending = true;
      _sent.add(ChatMessage(content: content, fromAssistant: false));
    });
    _input.clear();
    try {
      final reply = await AppScope.of(
        context,
      ).chatRepository.sendMessage(widget.analysisId, content);
      if (mounted) setState(() => _sent.add(reply));
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(context.tr('errorGeneric'))));
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  String _displayContent(BuildContext context, String content) =>
      content.startsWith('analysisChat') ? context.tr(content) : content;

  @override
  void dispose() {
    _input.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text(context.tr('analysisChatTitle'))),
    body: SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.md,
              AppSpacing.md,
              AppSpacing.md,
              0,
            ),
            child: AppCard(
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: Theme.of(
                      context,
                    ).colorScheme.primaryContainer,
                    child: Icon(
                      Icons.auto_awesome,
                      color: Theme.of(context).colorScheme.onPrimaryContainer,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Text(
                      context.tr('analysisChatTitle'),
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: FutureBuilder<List<ChatMessage>>(
              future: _messages,
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return RetryState(
                    messageKey: 'errorGeneric',
                    onRetry: () => setState(() => _messages = _load()),
                  );
                }
                final messages = [...snapshot.data!, ..._sent];
                return ListView(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  children: messages
                      .map(
                        (message) => Align(
                          alignment: message.fromAssistant
                              ? Alignment.centerLeft
                              : Alignment.centerRight,
                          child: Container(
                            constraints: BoxConstraints(
                              maxWidth: MediaQuery.sizeOf(context).width * 0.78,
                            ),
                            margin: const EdgeInsets.symmetric(
                              vertical: AppSpacing.xs,
                            ),
                            padding: const EdgeInsets.all(AppSpacing.md),
                            decoration: BoxDecoration(
                              color: message.fromAssistant
                                  ? Theme.of(
                                      context,
                                    ).colorScheme.surfaceContainerHighest
                                  : Theme.of(
                                      context,
                                    ).colorScheme.primaryContainer,
                              borderRadius: BorderRadius.circular(
                                AppRadius.card,
                              ),
                            ),
                            child: Text(
                              _displayContent(context, message.content),
                              style: Theme.of(context).textTheme.bodyMedium
                                  ?.copyWith(
                                    color: message.fromAssistant
                                        ? Theme.of(
                                            context,
                                          ).colorScheme.onSurface
                                        : Theme.of(
                                            context,
                                          ).colorScheme.onPrimaryContainer,
                                  ),
                            ),
                          ),
                        ),
                      )
                      .toList(),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: AppCard(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Expanded(
                    child: AppTextField(
                      label: context.tr('analysisChatInput'),
                      icon: Icons.chat,
                      controller: _input,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  IconButton.filled(
                    onPressed: _sending ? null : _send,
                    icon: const Icon(Icons.send),
                    tooltip: context.tr('analysisChatSend'),
                  ),
                ],
              ),
            ),
          ),
          if (_sending)
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: AppSpacing.md),
              child: LinearProgressIndicator(),
            ),
        ],
      ),
    ),
  );
}
