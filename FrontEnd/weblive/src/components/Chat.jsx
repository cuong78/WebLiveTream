import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket.jsx';
import './Chat.css';

const Chat = () => {
  const { connected, messages, sendMessage } = useWebSocket();
  const [displayName, setDisplayName] = useState(localStorage.getItem('chatDisplayName') || '');
  const [messageContent, setMessageContent] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleJoinChat = (e) => {
    e.preventDefault();
    if (displayName.trim() && connected) {
      localStorage.setItem('chatDisplayName', displayName.trim());
      setHasJoined(true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageContent.trim() && displayName.trim() && connected) {
      if (sendMessage(displayName.trim(), messageContent.trim())) {
        setMessageContent('');
      }
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMessageClassName = (messageType) => {
    switch (messageType) {
      case 'SYSTEM':
        return 'message system-message';
      case 'ERROR':
        return 'message error-message';
      default:
        return 'message chat-message';
    }
  };

  if (!connected) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h3>💬 Chat Trực Tiếp</h3>
          <div className="connection-status disconnected">
            Đang kết nối...
          </div>
        </div>
        <div className="chat-body">
          <div className="chat-loading">
            <div className="loading-spinner"></div>
            <p>Đang kết nối chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasJoined) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h3>💬 Chat Trực Tiếp</h3>
          <div className="connection-status connected">
            Đã kết nối
          </div>
        </div>
        <div className="chat-body">
          <div className="join-chat">
            <h4>Tham gia chat</h4>
            <p>Nhập tên hiển thị để tham gia trò chuyện</p>
            <form onSubmit={handleJoinChat}>
              <input
                type="text"
                placeholder="Tên hiển thị của bạn..."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                required
                className="display-name-input"
              />
              <button type="submit" className="join-btn">
                Tham gia chat
              </button>
            </form>
            <div className="chat-rules">
              <h5>📋 Quy định chat:</h5>
              <ul>
                <li>Không được cá cược dưới mọi hình thức</li>
                <li>Không chửi thề, xúc phạm</li>
                <li>Thảo luận văn minh, lịch sự</li>
                <li>Không spam tin nhắn</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>💬 Chat Trực Tiếp</h3>
        <div className="chat-header-info">
          <div className="connection-status connected">
            Đã kết nối
          </div>
          <div className="message-count">
            {messages.length}/300 tin nhắn
          </div>
        </div>
      </div>

      <div className="chat-body">
        <div className="messages-container" ref={messagesContainerRef}>
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>Chưa có tin nhắn nào. Hãy là người đầu tiên!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={getMessageClassName(message.type)}>
                <div className="message-header">
                  <span className="sender">{message.displayName}</span>
                  <span className="timestamp">{formatTime(message.timestamp)}</span>
                </div>
                <div className="message-content">{message.content}</div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <div className="current-user">
            <span>Chat với tên: <strong>{displayName}</strong></span>
            <button 
              onClick={() => setHasJoined(false)}
              className="change-name-btn"
            >
              Đổi tên
            </button>
          </div>
          
          <form onSubmit={handleSendMessage} className="message-form">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              maxLength={500}
              required
              className="message-input"
            />
            <button type="submit" className="send-btn">
              Gửi
            </button>
          </form>
          
          <div className="message-counter">
            {messageContent.length}/500 ký tự
          </div>
        </div>
      </div>

      <div className="chat-notice">
        <p><strong>⚠️ Lưu ý:</strong> Chỉ hiển thị 300 tin nhắn gần nhất</p>
      </div>
    </div>
  );
};

export default Chat;
