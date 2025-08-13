import React, { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

interface ChatMessage {
  id: string;
  displayName: string;
  content: string;
  timestamp: string;
  type: string;
}

const ChatComponent: React.FC = () => {
  const [name, setName] = useState(() => localStorage.getItem('chat_name') || '');
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const chatListRef = useRef<HTMLDivElement>(null);

  // Load messages from API on component mount
  useEffect(() => {
    fetchMessages();
  }, []);

  // Setup WebSocket connection
  useEffect(() => {
    setupWebSocket();

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/chat/history`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const setupWebSocket = () => {
    const client = new Client({
      webSocketFactory: () => {
        return new SockJS(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/ws`);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('Connected to WebSocket');
        setIsConnected(true);

        client.subscribe('/topic/public', (message) => {
          const newMessage = JSON.parse(message.body);
          setMessages(prev => [...prev, newMessage]);
        });
      },
      onDisconnect: () => {
        console.log('Disconnected from WebSocket');
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('WebSocket error:', frame.headers.message);
      }
    });

    client.activate();
    clientRef.current = client;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !content.trim()) return;

    const messageRequest = {
      displayName: name,
      content: content
    };

    try {
      localStorage.setItem('chat_name', name);

      if (clientRef.current && isConnected) {
        clientRef.current.publish({
          destination: '/app/chat.sendMessage',
          body: JSON.stringify(messageRequest)
        });
      } else {
        const tempMessage = {
          id: Date.now().toString(),
          displayName: name,
          content: content,
          timestamp: new Date().toISOString(),
          type: 'CHAT'
        };

        console.warn('WebSocket disconnected, message will be shown locally only');
        setMessages(prev => [...prev, tempMessage]);
      }

      setContent('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">G3 Chọi Tiêu Phong</div>
      <div className="phone-number">0345357695</div>
      <div className="warning-message">CẤM CÁ CƯỢC, CHỬI THỀ, KHOÁ NICK!</div>

      <div className="chat-messages" ref={chatListRef}>
        {messages.length === 0 ? (
          <div className="empty-message">Chưa có tin nhắn nào</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.type === 'SYSTEM' ? 'system-message' : ''}`}>
              <div className="message-header">
                <span className="message-sender">{msg.displayName}</span>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="chat-form">
        <input
          type="text"
          className="chat-input"
          placeholder="Tên hiển thị"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="message-input-container">
          <input
            type="text"
            className="chat-input message-input"
            placeholder="Nhập tin nhắn..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <button
            type="submit"
            className="send-button"
            disabled={!isConnected && !import.meta.env.VITE_API_URL}
          >
            {isConnected ? 'Gửi' : 'Kết nối lại...'}
          </button>
        </div>
      </form>

      <div className="connection-status">
        Trạng thái: {isConnected ? (
          <span style={{ color: 'green' }}>Đã kết nối</span>
        ) : (
          <span style={{ color: 'red' }}>Đang kết nối...</span>
        )}
      </div>

      <div className="contact-info">
        <div className="contact-title">Liên hệ CLB Gà Chọi Tiêu Phong</div>
        <div className="contact-details">
          0345 357 695<br />
          Giao Lưu Mua Bán Toàn Quốc<br />
          Địa chỉ: Khu Phố Phú Thứ, Thị Trấn Phú Thứ, Huyện Tây Hòa, Tỉnh Phú Yên
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;