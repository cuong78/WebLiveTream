package cuong.web.livetream.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SignalingWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper mapper = new ObjectMapper();

    // roomId -> admin session
    private final Map<String, WebSocketSession> roomIdToAdmin = new ConcurrentHashMap<>();
    // roomId -> viewers
    private final Map<String, Map<String, WebSocketSession>> roomIdToViewers = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        cleanup(session);
        super.afterConnectionClosed(session, status);
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        JsonNode json = mapper.readTree(message.getPayload());
        String type = json.path("type").asText();
        String room = json.path("room").asText("default");

        switch (type) {
            case "admin-join" -> handleAdminJoin(room, session);
            case "viewer-join" -> handleViewerJoin(room, session);
            case "offer" -> forwardToViewer(room, json.path("viewerId").asText(), message);
            case "answer" -> forwardToAdmin(room, message);
            case "candidate" -> forwardCandidate(room, json, message);
            default -> {
            }
        }
    }

    private void handleAdminJoin(String room, WebSocketSession session) {
        roomIdToAdmin.put(room, session);
        roomIdToViewers.computeIfAbsent(room, k -> new ConcurrentHashMap<>());
    }

    private void handleViewerJoin(String room, WebSocketSession session) throws IOException {
        roomIdToViewers.computeIfAbsent(room, k -> new ConcurrentHashMap<>())
                .put(session.getId(), session);
        // notify admin new viewer id
        WebSocketSession admin = roomIdToAdmin.get(room);
        if (admin != null && admin.isOpen()) {
            admin.sendMessage(new TextMessage("{" +
                    "\"type\":\"viewer-join\",\"viewerId\":\"" + session.getId() + "\"}"));
        }
    }

    private void forwardToAdmin(String room, TextMessage message) throws IOException {
        WebSocketSession admin = roomIdToAdmin.get(room);
        if (admin != null && admin.isOpen()) {
            admin.sendMessage(message);
        }
    }

    private void forwardToViewer(String room, String viewerId, TextMessage message) throws IOException {
        Map<String, WebSocketSession> viewers = roomIdToViewers.get(room);
        if (viewers == null) return;
        WebSocketSession viewer = viewers.get(viewerId);
        if (viewer != null && viewer.isOpen()) {
            viewer.sendMessage(message);
        }
    }

    private void forwardCandidate(String room, JsonNode json, TextMessage raw) throws IOException {
        String target = json.path("target").asText(); // "admin" or viewerId
        if ("admin".equals(target)) {
            forwardToAdmin(room, raw);
        } else {
            forwardToViewer(room, target, raw);
        }
    }

    private void cleanup(WebSocketSession session) {
        roomIdToAdmin.entrySet().removeIf(e -> e.getValue().getId().equals(session.getId()));
        roomIdToViewers.values().forEach(map -> map.values().removeIf(s -> s.getId().equals(session.getId())));
    }
}


