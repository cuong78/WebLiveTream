package cuong.web.livetream;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

@SpringBootTest
public class WebSocketTest {

    @Test
    public void testWebSocketEndpoint() {
        WebSocketClient client = new StandardWebSocketClient();
        WebSocketStompClient stompClient = new WebSocketStompClient(client);

        stompClient.connect(
                "ws://localhost:8080/api/chat",
                new StompSessionHandlerAdapter() {}
        );

        // Kiểm tra log xem kết nối có thành công không
    }
}