import { io } from 'socket.io-client';
import type { ChatMessage } from '../types';

type SocketType = ReturnType<typeof io>;

class SocketService {
  private socket: SocketType | null = null;
  private isConnected = false;

  connect(serverUrl: string = 'http://localhost:8080'): SocketType {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Connection error:', error);
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_error', (error: any) => {
      console.error('Reconnection error:', error);
    });
  }

  // Chat functionality
  joinChatRoom(streamId: string): void {
    if (this.socket) {
      this.socket.emit('join-chat', streamId);
    }
  }

  leaveChatRoom(streamId: string): void {
    if (this.socket) {
      this.socket.emit('leave-chat', streamId);
    }
  }

  sendChatMessage(streamId: string, username: string, message: string): void {
    if (this.socket && this.isConnected) {
      const chatMessage = {
        streamId,
        username,
        message,
        timestamp: new Date(),
        type: 'normal' as const
      };
      this.socket.emit('chat-message', chatMessage);
    }
  }

  onChatMessage(callback: (message: ChatMessage) => void): void {
    if (this.socket) {
      this.socket.on('chat-message', callback);
    }
  }

  onChatHistory(callback: (messages: ChatMessage[]) => void): void {
    if (this.socket) {
      this.socket.on('chat-history', callback);
    }
  }

  offChatMessage(): void {
    if (this.socket) {
      this.socket.off('chat-message');
    }
  }

  offChatHistory(): void {
    if (this.socket) {
      this.socket.off('chat-history');
    }
  }

  // Stream functionality
  joinStreamRoom(streamId: string): void {
    if (this.socket) {
      this.socket.emit('join-stream', streamId);
    }
  }

  leaveStreamRoom(streamId: string): void {
    if (this.socket) {
      this.socket.emit('leave-stream', streamId);
    }
  }

  onStreamStatusUpdate(callback: (data: { streamId: string; isLive: boolean; viewerCount: number }) => void): void {
    if (this.socket) {
      this.socket.on('stream-status-update', callback);
    }
  }

  onViewerCountUpdate(callback: (data: { streamId: string; viewerCount: number }) => void): void {
    if (this.socket) {
      this.socket.on('viewer-count-update', callback);
    }
  }

  offStreamStatusUpdate(): void {
    if (this.socket) {
      this.socket.off('stream-status-update');
    }
  }

  offViewerCountUpdate(): void {
    if (this.socket) {
      this.socket.off('viewer-count-update');
    }
  }

  // Streamer functionality
  startStreaming(streamId: string, streamKey: string): void {
    if (this.socket) {
      this.socket.emit('start-streaming', { streamId, streamKey });
    }
  }

  stopStreaming(streamId: string): void {
    if (this.socket) {
      this.socket.emit('stop-streaming', streamId);
    }
  }

  onStreamStarted(callback: (data: { streamId: string; success: boolean; message?: string }) => void): void {
    if (this.socket) {
      this.socket.on('stream-started', callback);
    }
  }

  onStreamStopped(callback: (data: { streamId: string; success: boolean; message?: string }) => void): void {
    if (this.socket) {
      this.socket.on('stream-stopped', callback);
    }
  }

  // Utility methods
  isSocketConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): SocketType | null {
    return this.socket;
  }

  // Clean up all event listeners
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
