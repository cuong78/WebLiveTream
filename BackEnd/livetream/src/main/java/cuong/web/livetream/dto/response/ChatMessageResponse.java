package cuong.web.livetream.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private String id;
    private String displayName;
    private String content;
    private LocalDateTime timestamp;
    private String type; // CHAT, SYSTEM, etc.
}