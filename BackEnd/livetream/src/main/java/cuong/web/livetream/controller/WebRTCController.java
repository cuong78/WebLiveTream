package cuong.web.livetream.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Controller
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class WebRTCController {

    private final SimpMessagingTemplate messagingTemplate;
    
    // Store viewer counter
    private final AtomicInteger viewerIdCounter = new AtomicInteger(0);

    @MessageMapping("/webrtc/admin_ready")
    public void handleAdminReady(Map<String, Object> message) {
        log.info("Admin ready to stream: {}", message);
        
        // Notify all viewers that admin is ready
        messagingTemplate.convertAndSend("/topic/webrtc", Map.of(
            "type", "admin-ready",
            "message", "Admin is ready to stream"
        ));
    }

    @MessageMapping("/webrtc/admin_stopped")
    public void handleAdminStopped(Map<String, Object> message) {
        log.info("Admin stopped streaming: {}", message);
        
        // Notify all viewers that admin stopped
        messagingTemplate.convertAndSend("/topic/webrtc", Map.of(
            "type", "admin-stopped",
            "message", "Admin stopped streaming"
        ));
    }

    @MessageMapping("/webrtc/viewer_join")
    public void handleViewerJoin(Map<String, Object> message) {
        String viewerId = "viewer_" + viewerIdCounter.incrementAndGet();
        log.info("Viewer {} wants to join: {}", viewerId, message);
        
        // Send viewer join notification to admin
        messagingTemplate.convertAndSend("/topic/webrtc", Map.of(
            "type", "viewer-join",
            "viewerId", viewerId,
            "message", "New viewer wants to join"
        ));
    }

    @MessageMapping("/webrtc/offer")
    public void handleOffer(Map<String, Object> message) {
        String viewerId = (String) message.get("viewerId");
        log.info("Sending offer to viewer: {} with message: {}", viewerId, message);
        
        // Send offer to specific viewer
        messagingTemplate.convertAndSend("/topic/webrtc", Map.of(
            "type", "offer",
            "offer", message.get("offer"),
            "viewerId", viewerId
        ));
    }

    @MessageMapping("/webrtc/answer")
    public void handleAnswer(Map<String, Object> message) {
        String viewerId = (String) message.get("viewerId");
        log.info("Received answer from viewer: {} with message: {}", viewerId, message);
        
        // Send answer to admin
        messagingTemplate.convertAndSend("/topic/webrtc", Map.of(
            "type", "answer",
            "answer", message.get("answer"),
            "viewerId", viewerId
        ));
    }

    @MessageMapping("/webrtc/ice_candidate")
    public void handleIceCandidate(Map<String, Object> message) {
        String viewerId = (String) message.get("viewerId");
        
        log.info("ICE candidate exchange for viewer: {} with message: {}", viewerId, message);
        
        // Broadcast ICE candidate
        messagingTemplate.convertAndSend("/topic/webrtc", Map.of(
            "type", "ice-candidate",
            "candidate", message.get("candidate"),
            "viewerId", viewerId
        ));
    }
}
