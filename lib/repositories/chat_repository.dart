class ChatMessage {
  const ChatMessage({required this.content, required this.fromAssistant});

  final String content;
  final bool fromAssistant;
}

abstract interface class ChatRepository {
  Future<List<ChatMessage>> getMessages(int analysisId);
  Future<ChatMessage> sendMessage(int analysisId, String content);
}
