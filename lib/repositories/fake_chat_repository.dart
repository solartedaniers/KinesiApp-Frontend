import 'chat_repository.dart';

/// Implementación temporal, reemplazar cuando exista el endpoint real en docs/design/video-analysis-pipeline.md §10.3.
class FakeChatRepository implements ChatRepository {
  final Map<int, List<ChatMessage>> _messages = {};

  @override
  Future<List<ChatMessage>> getMessages(int analysisId) async =>
      List.unmodifiable(
        _messages.putIfAbsent(
          analysisId,
          () => [
            const ChatMessage(
              content: 'analysisChatWelcome',
              fromAssistant: true,
            ),
          ],
        ),
      );

  @override
  Future<ChatMessage> sendMessage(int analysisId, String content) async {
    final messages = _messages.putIfAbsent(analysisId, () => []);
    messages.add(ChatMessage(content: content, fromAssistant: false));
    await Future<void>.delayed(const Duration(seconds: 2));
    const reply = ChatMessage(
      content: 'analysisChatReply',
      fromAssistant: true,
    );
    messages.add(reply);
    return reply;
  }
}
