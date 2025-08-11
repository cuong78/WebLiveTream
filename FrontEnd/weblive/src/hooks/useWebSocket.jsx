import { useState, useEffect, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const useWebSocket = () => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [streamStatus, setStreamStatus] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [client, setClient] = useState(null);

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
    stompClient.onConnect = (frame) => {
      console.log('WebSocket Connected:', frame);
      setConnected(true);
      setClient(stompClient);

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
  }, []);

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
