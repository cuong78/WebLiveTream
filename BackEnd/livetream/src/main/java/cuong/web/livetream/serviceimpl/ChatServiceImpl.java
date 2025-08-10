package cuong.web.livetream.serviceimpl;

import cuong.web.livetream.dto.response.ChatMessageResponse;
import cuong.web.livetream.service.ChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
@Slf4j
public class ChatServiceImpl implements ChatService {

    private final ConcurrentLinkedQueue<ChatMessageResponse> messageQueue = new ConcurrentLinkedQueue<>();
    private static final int MAX_MESSAGES = 300;

    @Override
    public void addMessage(ChatMessageResponse message) {
        messageQueue.offer(message);
        
        // Keep only the latest 300 messages
        while (messageQueue.size() > MAX_MESSAGES) {
            messageQueue.poll();
        }
        
        log.info("Added message from {}: {}. Total messages: {}", 
                message.getDisplayName(), message.getContent(), messageQueue.size());
    }

    @Override
    public List<ChatMessageResponse> getRecentMessages() {
        return new ArrayList<>(messageQueue);
    }

    @Override
    public String cleanMessage(String content) {
        if (content == null) return "";
        
        // Remove dangerous HTML/script tags and trim
        String cleaned = content.replaceAll("<[^>]*>", "")
                               .replaceAll("(?i)script", "")
                               .trim();
        
        // Limit length
        if (cleaned.length() > 500) {
            cleaned = cleaned.substring(0, 500) + "...";
        }
        
        return cleaned;
    }

    @Override
    public String cleanDisplayName(String displayName) {
        if (displayName == null) return "Anonymous";
        
        // Remove dangerous characters and trim
        String cleaned = displayName.replaceAll("[<>\"'&]", "")
                                   .trim();
        
        // Limit length
        if (cleaned.length() > 50) {
            cleaned = cleaned.substring(0, 50);
        }
        
        return cleaned.isEmpty() ? "Anonymous" : cleaned;
    }

    @Override
    public void clearMessages() {
        messageQueue.clear();
        log.info("All chat messages cleared");
    }
}
