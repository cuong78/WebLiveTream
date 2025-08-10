#!/bin/bash

# Script để test live stream trên nhiều tab/window
echo "🚀 Khởi động test live stream đa tab..."

# Kiểm tra nếu backend đang chạy
echo "📡 Kiểm tra backend..."
if curl -s http://localhost:8080/api/livestream/status > /dev/null; then
    echo "✅ Backend đang chạy tại http://localhost:8080"
else
    echo "❌ Backend chưa chạy. Vui lòng khởi động backend trước!"
    echo "   cd BackEnd/livetream && ./mvnw spring-boot:run"
    exit 1
fi

# Kiểm tra nếu frontend đang chạy
echo "🌐 Kiểm tra frontend..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend đang chạy tại http://localhost:5173"
else
    echo "❌ Frontend chưa chạy. Vui lòng khởi động frontend trước!"
    echo "   cd FrontEnd/weblive && npm run dev"
    exit 1
fi

echo ""
echo "🎯 Hướng dẫn test live stream đa tab:"
echo ""
echo "1. 🔑 Đăng nhập Admin:"
echo "   - Mở http://localhost:5173/login"
echo "   - Username: admin"
echo "   - Password: admin123"
echo ""
echo "2. 📹 Bắt đầu live stream:"
echo "   - Vào trang Admin: http://localhost:5173/admin"
echo "   - Click 'Bắt đầu Live Stream'"
echo "   - Cho phép truy cập camera khi được hỏi"
echo ""
echo "3. 👥 Test đa tab/thiết bị:"
echo "   a) Mở tab mới: http://localhost:5173"
echo "   b) Mở trên điện thoại (cùng WiFi): http://[IP_máy_tính]:5173"
echo "   c) Chia sẻ cho bạn bè cùng mạng"
echo ""
echo "4. ✅ Kiểm tra tính năng:"
echo "   - Viewer count tự động tăng/giảm"
echo "   - WebSocket kết nối real-time"
echo "   - Camera admin hiển thị trên tất cả tab"
echo ""
echo "5. 🛠️ Để xem video thật trên tất cả tab:"
echo "   - Cần thêm WebRTC/RTMP streaming server"
echo "   - Hiện tại chỉ admin thấy camera trực tiếp"
echo "   - Viewer thấy placeholder với hướng dẫn"
echo ""

# Lấy IP của máy để chia sẻ
IP=$(hostname -I | awk '{print $1}' 2>/dev/null || ipconfig getifaddr en0 2>/dev/null || echo "localhost")
echo "🌍 IP máy tính của bạn: $IP"
echo "   Link chia sẻ: http://$IP:5173"
echo ""
echo "✨ Chúc bạn test thành công!"
