import { useState, useEffect, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { chatAPI } from '../services/api';

export const useWebSocket = () => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState(() => {
    // Load messages from localStorage on initial load
    try {
      const savedMessages = localStorage.getItem('chatMessages');
      return savedMessages ? JSON.parse(savedMessages) : [];
    } catch (error) {
      console.error('Error loading messages from localStorage:', error);
      return [];
    }
  });
  const [streamStatus, setStreamStatus] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [client, setClient] = useState(null);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
  }, [messages]);

  // Function to load chat history
  const loadChatHistory = useCallback(async () => {
    console.log('🔄 Loading chat history...');
    try {
      const response = await chatAPI.getHistory();
      console.log('📡 Chat history response:', response);
      if (response.data && Array.isArray(response.data)) {
        console.log('📥 Server messages:', response.data.length);
        // Merge server history with local messages, remove duplicates
        setMessages(prev => {
          console.log('💾 Local messages before merge:', prev.length);
          const serverMessages = response.data;
          const allMessages = [...serverMessages];
          
          // Add any local messages that aren't in server history
          prev.forEach(localMsg => {
            const exists = serverMessages.some(serverMsg => 
              serverMsg.content === localMsg.content && 
              serverMsg.sender === localMsg.sender &&
              Math.abs(new Date(serverMsg.timestamp) - new Date(localMsg.timestamp)) < 1000
            );
            if (!exists) {
              allMessages.push(localMsg);
            }
          });
          
          // Sort by timestamp
          allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          console.log('🔄 Final merged messages:', allMessages.length);
          return allMessages;
        });
        console.log('✅ Loaded chat history:', response.data.length, 'messages');
      } else {
        console.log('❌ Invalid response format or empty data');
      }
    } catch (error) {
      console.error('❌ Error loading chat history:', error);
    }
  }, []);

  useEffect(() => {
    // Create STOMP client
    const stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      debug: (str) => console.log('STOMP:', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // Connection success
    stompClient.onConnect = async (frame) => {
      console.log('🔌 WebSocket Connected:', frame);
      setConnected(true);
      setClient(stompClient);

      // Load chat history first
      console.log('🔄 About to load chat history...');
      await loadChatHistory();

      // Subscribe to topics AFTER connection is established
      stompClient.subscribe('/topic/public', (message) => {
        const chatMessage = JSON.parse(message.body);
        setMessages(prev => [...prev, chatMessage]);
      });

      stompClient.subscribe('/topic/viewer-count', (message) => {
        const count = parseInt(message.body);
        setViewerCount(count);
      });

      stompClient.subscribe('/topic/stream-status', (message) => {
        const status = JSON.parse(message.body);
        setStreamStatus(status);
      });
    };

    // Connection error
    stompClient.onStompError = (frame) => {
      console.error('STOMP Error:', frame);
      setConnected(false);
    };

    // WebSocket error
    stompClient.onWebSocketError = (error) => {
      console.error('WebSocket Error:', error);
      setConnected(false);
    };

    // Start connection
    stompClient.activate();

    // Cleanup on unmount
    return () => {
      if (stompClient) {
        stompClient.deactivate();
        setConnected(false);
        setClient(null);
      }
    };
  }, [loadChatHistory]);

  const sendMessage = useCallback((displayName, content) => {
    if (client && connected) {
      client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({ displayName: displayName, content })
      });
      return true;
    }
    return false;
  }, [client, connected]);

  const joinChat = useCallback((displayName) => {
    if (client && connected) {
      client.publish({
        destination: '/app/chat.addUser',
        body: JSON.stringify({ displayName: displayName, type: 'JOIN' })
      });
      return true;
    }
    return false;
  }, [client, connected]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    // Also clear localStorage
    try {
      localStorage.removeItem('chatMessages');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, []);

  return {
    connected,
    messages,
    streamStatus,
    viewerCount,
    sendMessage,
    joinChat,
    clearMessages,
  };
};
