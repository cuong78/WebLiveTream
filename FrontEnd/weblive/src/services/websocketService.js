import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        // Get JWT token from localStorage
        const token = localStorage.getItem('token');
        
        // Create STOMP client with authentication headers
        this.client = new Client({
          webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
          connectHeaders: token ? {
            'Authorization': `Bearer ${token}`
          } : {},
          debug: (str) => {
            console.log('STOMP Debug:', str);
          },
          reconnectDelay: this.reconnectInterval,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        // Connection established
        this.client.onConnect = (frame) => {
          console.log('WebSocket connected:', frame);
          this.connected = true;
          this.reconnectAttempts = 0;
          resolve(frame);
        };

        // Connection error
        this.client.onStompError = (frame) => {
          console.error('STOMP error:', frame);
          this.connected = false;
          reject(new Error('WebSocket connection failed'));
        };

        // WebSocket error
        this.client.onWebSocketError = (error) => {
          console.error('WebSocket error:', error);
          this.connected = false;
          reject(error);
        };

        // Connection closed
        this.client.onWebSocketClose = (event) => {
          console.log('WebSocket closed:', event);
          this.connected = false;
          this.attemptReconnect();
        };

        // Activate the client
        this.client.activate();

      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        reject(error);
      }
    });
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
    }
  }

  // Subscribe to chat messages
  subscribeToChatMessages(callback) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    return this.client.subscribe('/topic/public', (message) => {
      try {
        const chatMessage = JSON.parse(message.body);
        callback(chatMessage);
      } catch (error) {
        console.error('Error parsing chat message:', error);
      }
    });
  }

  // Subscribe to stream status updates
  subscribeToStreamStatus(callback) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    return this.client.subscribe('/topic/stream-status', (message) => {
      try {
        const status = JSON.parse(message.body);
        callback(status);
      } catch (error) {
        console.error('Error parsing stream status:', error);
      }
    });
  }

  // Subscribe to viewer count updates
  subscribeToViewerCount(callback) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    return this.client.subscribe('/topic/viewer-count', (message) => {
      try {
        const count = parseInt(message.body);
        callback(count);
      } catch (error) {
        console.error('Error parsing viewer count:', error);
      }
    });
  }

  // Send chat message
  sendChatMessage(displayName, content) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return false;
    }

    try {
      this.client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          displayName: displayName,
          content: content
        })
      });
      return true;
    } catch (error) {
      console.error('Error sending chat message:', error);
      return false;
    }
  }

  // Join chat
  joinChat(displayName) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return false;
    }

    try {
      this.client.publish({
        destination: '/app/chat.addUser',
        body: displayName
      });
      return true;
    } catch (error) {
      console.error('Error joining chat:', error);
      return false;
    }
  }

  isConnected() {
    return this.connected;
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;
