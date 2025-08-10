package cuong.web.livetream.service;

import cuong.web.livetream.dto.response.ChatMessageResponse;

import java.util.List;

public interface ChatService {
    void addMessage(ChatMessageResponse message);
    List<ChatMessageResponse> getRecentMessages();
    String cleanMessage(String content);
    String cleanDisplayName(String displayName);
    void clearMessages();
}
