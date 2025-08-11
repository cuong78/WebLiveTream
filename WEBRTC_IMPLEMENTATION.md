# WebRTC Live Streaming Implementation

## Tóm tắt thay đổi

Đã implement **WebRTC** để cho phép admin phát video thật tới viewer thay vì chỉ video mô phỏng.

### Những thay đổi chính:

#### 1. Frontend (d:\github\WebLiveTream\FrontEnd\weblive\src\)

- **`services/webrtcService.js`** - Service quản lý WebRTC P2P connection
- **`components/RealLiveStream.jsx`** - Component livestream thật thay thế MockVideoStream
- **`components/RealLiveStream.css`** - Styles cho video thật
- **`pages/Home.jsx`** - Cập nhật để sử dụng RealLiveStream

#### 2. Backend (d:\github\WebLiveTream\BackEnd\livetream\src\main\java\)

- **`controller/WebRTCController.java`** - WebRTC signaling server
- **`config/WebSocketConfig.java`** - Đã có sẵn, hỗ trợ STOMP

## Cách hoạt động

### 1. Admin (Người phát):
1. Đăng nhập và start livestream từ admin panel
2. Browser yêu cầu quyền camera/microphone
3. WebRTC service bắt đầu stream và thông báo có admin ready
4. Khi có viewer join, tạo P2P connection với viewer

### 2. Viewer (Người xem):
1. Vào trang chủ khi admin đang live
2. Tự động connect tới admin qua WebRTC
3. Nhận video stream thật từ camera admin
4. Hiển thị video thay vì video mô phỏng

### 3. Signaling Flow:
```
Admin                    Server                    Viewer
  |                        |                        |
  |-- admin-ready -------->|------- broadcast ------>|
  |                        |<------ viewer-join -----|
  |<----- viewer-join -----|                        |
  |-- offer -------------->|------- offer ---------->|
  |                        |<------ answer ----------|
  |<----- answer ----------|                        |
  |-- ice-candidate ------>|-- ice-candidate ------->|
  |<-- ice-candidate ------|<-- ice-candidate -------|
  |                        |                        |
  |========== P2P Video Stream ===================>|
```

## Hướng dẫn deploy production

### 1. Cập nhật config cho production server

**Frontend - `src/services/webrtcService.js`:**
```javascript
// Thay đổi dòng này
const socket = new SockJS(`http://${window.location.hostname}:8080/ws`);

// Thành
const socket = new SockJS(`https://yourserver.com:8080/ws`);
// Hoặc nếu cùng domain:
const socket = new SockJS('/ws');
```

**Frontend - `src/services/websocketService.js`:**
```javascript
// Thay đổi
webSocketFactory: () => new SockJS('http://localhost:8080ws'),

// Thành  
webSocketFactory: () => new SockJS('https://yourserver.com/ws'),
```

### 2. Backend CORS config

**Cập nhật `config/CORSConfig.java`:**
```java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
            .allowedOrigins("https://yourfrontenddomain.com", "http://localhost:5173")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowCredentials(true);
}
```

### 3. STUN/TURN servers cho production

**Cập nhật `webrtcService.js`:**
```javascript
this.configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Thêm TURN server cho môi trường production
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'username',
      credential: 'password'
    }
  ]
};
```

### 4. HTTPS requirement

WebRTC yêu cầu HTTPS trong production. Đảm bảo:
- Frontend serve qua HTTPS
- Backend API qua HTTPS 
- WebSocket qua WSS (Secure WebSocket)

## Test local

### 1. Start Backend:
```bash
cd /d/github/WebLiveTream/BackEnd/livetream
mvn spring-boot:run
```

### 2. Start Frontend:
```bash
cd /d/github/WebLiveTream/FrontEnd/weblive  
npm run dev
```

### 3. Test flow:

1. Mở browser 1: `http://localhost:5173/admin` 
   - Login admin
   - Start livestream
   - Cho phép camera access

2. Mở browser 2: `http://localhost:5173`
   - Sẽ thấy "Đang kết nối với admin..."
   - Sau đó hiển thị video thật từ camera admin

## Troubleshooting

### 1. Không thấy video:
- Check browser console logs
- Đảm bảo camera permission được cấp
- Kiểm tra WebSocket connection

### 2. Deploy lên server không hoạt động:
- Cần HTTPS cho WebRTC
- Cần TURN server nếu qua NAT/Firewall
- Check CORS settings

### 3. Performance issues:
- Giảm video resolution trong `useCamera.jsx`
- Implement video quality adaptation
- Sử dụng media server thay vì P2P

## Nâng cấp tiếp theo

1. **Media Server**: Sử dụng Janus, Kurento hoặc mediasoup để scale nhiều viewer
2. **Recording**: Lưu lại livestream
3. **Mobile optimization**: Tối ưu cho mobile browser
4. **Adaptive bitrate**: Tự động điều chỉnh chất lượng video
5. **Screen sharing**: Cho phép admin share màn hình

## Dependencies đã thêm

Frontend đã có sẵn:
- `@stomp/stompjs`: WebSocket STOMP client
- `sockjs-client`: SockJS client

Backend đã có sẵn Spring WebSocket support.
