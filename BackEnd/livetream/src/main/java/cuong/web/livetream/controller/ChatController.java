package cuong.web.livetream.controller;

import cuong.web.livetream.dto.request.ChatMessageRequest;
import cuong.web.livetream.dto.response.ChatMessageResponse;
import cuong.web.livetream.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.LocalDateTime;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessageResponse sendMessage(ChatMessageRequest message) {
        try {
            log.info("Received chat message: {} from {}", message.getContent(), message.getDisplayName());
            
            // Validate and clean message
            String cleanContent = chatService.cleanMessage(message.getContent());
            String cleanDisplayName = chatService.cleanDisplayName(message.getDisplayName());
            
            ChatMessageResponse response = new ChatMessageResponse(
                UUID.randomUUID().toString(),
                cleanDisplayName,
                cleanContent,
                LocalDateTime.now(),
                "CHAT"
            );
            
            // Add to chat history (max 300 messages)
            chatService.addMessage(response);
            
            return response;
        } catch (Exception e) {
            log.error("Error processing chat message", e);
            return new ChatMessageResponse(
                UUID.randomUUID().toString(),
                "System",
                "Có lỗi xảy ra khi gửi tin nhắn",
                LocalDateTime.now(),
                "ERROR"
            );
        }
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessageResponse addUser(String displayName) {
        String cleanDisplayName = chatService.cleanDisplayName(displayName);
        log.info("User joined: {}", cleanDisplayName);
        
        return new ChatMessageResponse(
            UUID.randomUUID().toString(),
            "System",
            cleanDisplayName + " đã tham gia chat",
            LocalDateTime.now(),
            "SYSTEM"
        );
    }
}
