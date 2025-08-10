export interface Stream {
  id: string;
  title: string;
  serverName: string;
  url: string;
  isLive: boolean;
  viewerCount: number;
  thumbnail?: string;
  scheduledTime?: Date;
}

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  type?: 'normal' | 'system' | 'warning';
}

export interface VideoRecord {
  id: string;
  title: string;
  date: Date;
  duration: number;
  thumbnail: string;
  url: string;
  description?: string;
}

export interface User {
  id: string;
  username: string;
  isStreamer: boolean;
  isAdmin: boolean;
}

export interface StreamConfig {
  streamKey: string;
  serverUrl: string;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  isPrivate: boolean;
}
