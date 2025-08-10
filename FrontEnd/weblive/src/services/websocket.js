import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscribers = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        resolve();
        return;
      }

      this.client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        connectHeaders: {},
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = (frame) => {
        console.log('Connected to WebSocket:', frame);
        this.connected = true;
        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error('STOMP Error:', frame.headers['message'], frame.body);
        this.connected = false;
        reject(new Error('WebSocket connection failed'));
      };

      this.client.onWebSocketClose = () => {
        console.log('WebSocket connection closed');
        this.connected = false;
      };

      this.client.activate();
    });
  }

  disconnect() {
    if (this.client && this.connected) {
      this.client.deactivate();
      this.connected = false;
      this.subscribers.clear();
    }
  }

  subscribe(destination, callback) {
    if (!this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const parsedMessage = JSON.parse(message.body);
        callback(parsedMessage);
      } catch (error) {
        console.error('Error parsing message:', error);
        callback(message.body);
      }
    });

    this.subscribers.set(destination, subscription);
    return subscription;
  }

  unsubscribe(destination) {
    const subscription = this.subscribers.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscribers.delete(destination);
    }
  }

  sendMessage(destination, message) {
    if (!this.connected) {
      console.error('WebSocket not connected');
      return false;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(message),
    });
    return true;
  }

  // Chat specific methods
  sendChatMessage(displayName, content) {
    return this.sendMessage('/app/chat.sendMessage', {
      displayName,
      content,
    });
  }

  joinChat(displayName) {
    return this.sendMessage('/app/chat.addUser', displayName);
  }

  subscribeToChatMessages(callback) {
    return this.subscribe('/topic/public', callback);
  }

  subscribeToStreamStatus(callback) {
    return this.subscribe('/topic/stream-status', callback);
  }

  subscribeToViewerCount(callback) {
    return this.subscribe('/topic/viewer-count', callback);
  }
}

export default new WebSocketService();
