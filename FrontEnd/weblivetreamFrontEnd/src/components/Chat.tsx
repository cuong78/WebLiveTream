import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentUser?: string;
  isConnected: boolean;
  className?: string;
}

const Chat: React.FC<ChatProps> = ({
  messages,
  onSendMessage,
  currentUser,
  isConnected,
  className = ''
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState(currentUser || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showUsernameInput, setShowUsernameInput] = useState(!currentUser);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && username.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setShowUsernameInput(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageStyle = (type?: string) => {
    switch (type) {
      case 'system':
        return 'text-yellow-400 font-semibold';
      case 'warning':
        return 'text-red-400 font-semibold';
      default:
        return 'text-gray-300';
    }
  };

  if (showUsernameInput) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
        <div className="text-center">
          <h3 className="text-white font-semibold mb-4">Nhập tên của bạn để chat</h3>
          <form onSubmit={handleUsernameSubmit} className="space-y-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tên của bạn..."
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              maxLength={20}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition-colors"
            >
              Bắt đầu chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg flex flex-col ${className}`}>
      {/* Chat Header */}
      <div className="bg-gray-700 px-4 py-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">💬 Chat trực tiếp</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-300">
              {isConnected ? 'Đã kết nối' : 'Mất kết nối'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-4 h-80 overflow-y-auto space-y-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Chưa có tin nhắn nào</p>
            <p className="text-sm">Hãy là người đầu tiên gửi tin nhắn!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="break-words">
              <div className="flex items-start space-x-2">
                <span className="text-xs text-gray-500 mt-1">
                  {formatTime(message.timestamp)}
                </span>
                <div className="flex-1">
                  <span className="text-blue-400 font-medium text-sm">
                    {message.username}:
                  </span>
                  <span className={`ml-2 text-sm ${getMessageStyle(message.type)}`}>
                    {message.message}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="mb-2 text-xs text-gray-400">
          Đang chat với tên: <span className="text-blue-400">{username}</span>
          <button 
            onClick={() => setShowUsernameInput(true)}
            className="ml-2 text-blue-400 hover:text-blue-300"
          >
            (đổi)
          </button>
        </div>
        
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
            maxLength={200}
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors text-sm"
          >
            Gửi
          </button>
        </form>
        
        {/* Chat Rules */}
        <div className="mt-3 text-xs text-gray-500">
          <p>⚠️ <strong>Quy định chat:</strong></p>
          <p>• Không cá cược, chửi thề</p>
          <p>• Không để số điện thoại</p>
          <p>• Vi phạm sẽ bị khóa nick</p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
