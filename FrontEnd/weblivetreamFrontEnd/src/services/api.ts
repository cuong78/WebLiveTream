import axios from 'axios';
import type { Stream, VideoRecord, ChatMessage } from '../types';
import authService from './authService';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - this will be handled by authService interceptor
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Stream endpoints
  getStreams: async (): Promise<Stream[]> => {
    try {
      const response = await api.get('/streams');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch streams:', error);
      // Return mock data for development
      return [
        {
          id: '1',
          title: 'Xổ gà Server HD1',
          serverName: 'HD1',
          url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
          isLive: true,
          viewerCount: 156,
          thumbnail: '',
          scheduledTime: new Date('2025-08-10T18:00:00')
        },
        {
          id: '2',
          title: 'Xổ gà Server HD2',
          serverName: 'HD2',
          url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
          isLive: false,
          viewerCount: 0,
          thumbnail: ''
        },
        {
          id: '3',
          title: 'Xổ gà Server HD3',
          serverName: 'HD3',
          url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
          isLive: true,
          viewerCount: 89,
          thumbnail: ''
        },
        {
          id: '4',
          title: 'Xổ gà Server HD4',
          serverName: 'HD4',
          url: '',
          isLive: false,
          viewerCount: 0,
          thumbnail: ''
        },
        {
          id: '5',
          title: 'Xổ gà Server HD5',
          serverName: 'HD5',
          url: '',
          isLive: false,
          viewerCount: 0,
          thumbnail: ''
        }
      ];
    }
  },

  getStream: async (id: string): Promise<Stream | null> => {
    try {
      const response = await api.get(`/streams/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch stream ${id}:`, error);
      return null;
    }
  },

  // Video archive endpoints
  getVideoArchive: async (): Promise<VideoRecord[]> => {
    try {
      const response = await api.get('/videos');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch video archive:', error);
      // Return mock data for development
      return [
        {
          id: '1',
          title: 'Video Xổ Gà Sáng 10/8 – CLB Gà Chọi Cậu Thanh',
          date: new Date('2025-08-10T08:00:00'),
          duration: 3600, // 1 hour
          thumbnail: 'https://via.placeholder.com/320x180/374151/9CA3AF?text=Video+1',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          description: 'Trận đấu gà hấp dẫn buổi sáng với nhiều trận đấu kịch tính'
        },
        {
          id: '2',
          title: 'Video Xổ Gà Tối 9/8 – CLB Gà Chọi Cậu Thanh',
          date: new Date('2025-08-09T18:00:00'),
          duration: 4200, // 1h 10m
          thumbnail: 'https://via.placeholder.com/320x180/374151/9CA3AF?text=Video+2',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          description: 'Buổi chiều với những trận đấu gay cấn và kịch tính'
        },
        {
          id: '3',
          title: 'Video Xổ Gà Tối 8/8 – CLB Gà Chọi Cậu Thanh',
          date: new Date('2025-08-08T18:00:00'),
          duration: 3900, // 1h 5m
          thumbnail: 'https://via.placeholder.com/320x180/374151/9CA3AF?text=Video+3',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          description: 'Ngày 8/8 với nhiều trận đấu đặc sắc'
        }
      ];
    }
  },

  getVideo: async (id: string): Promise<VideoRecord | null> => {
    try {
      const response = await api.get(`/videos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch video ${id}:`, error);
      return null;
    }
  },

  // Chat endpoints
  getChatHistory: async (streamId: string): Promise<ChatMessage[]> => {
    try {
      const response = await api.get(`/chat/${streamId}/history`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      return [];
    }
  },

  // Streaming endpoints (for streamers)
  createStream: async (streamData: Partial<Stream>): Promise<Stream> => {
    const response = await api.post('/streams', streamData);
    return response.data;
  },

  updateStream: async (id: string, streamData: Partial<Stream>): Promise<Stream> => {
    const response = await api.put(`/streams/${id}`, streamData);
    return response.data;
  },

  deleteStream: async (id: string): Promise<void> => {
    await api.delete(`/streams/${id}`);
  },

  startStream: async (id: string): Promise<void> => {
    await api.post(`/streams/${id}/start`);
  },

  stopStream: async (id: string): Promise<void> => {
    await api.post(`/streams/${id}/stop`);
  },

  // Viewer statistics
  updateViewerCount: async (streamId: string): Promise<void> => {
    try {
      await api.post(`/streams/${streamId}/view`);
    } catch (error) {
      console.error('Failed to update viewer count:', error);
    }
  }
};

export default apiService;
