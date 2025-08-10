import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (username, password) => 
    api.post('/login', { username, password }),
  register: (userData) => 
    api.post('/auth/register', userData),
  refreshToken: (refreshToken) => 
    api.post('/auth/refresh', { refreshToken }),
  logout: () => 
    api.post('/auth/logout'),
};

// Live Stream API
export const liveStreamAPI = {
  getStatus: () => 
    api.get('/livestream/status'),
  controlStream: (action, title, description) => 
    api.post('/livestream/control', { action, streamTitle: title, streamDescription: description }),
  joinAsViewer: () => 
    api.post('/livestream/viewer/join'),
  leaveAsViewer: () => 
    api.post('/livestream/viewer/leave'),
};

export default api;
