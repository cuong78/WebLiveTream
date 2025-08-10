import axios from 'axios';
import type { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenRequest } from '../types/auth';

const API_BASE_URL = 'http://localhost:8080/api';

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on initialization
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    
    // Set up axios interceptor for automatic token attachment
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    axios.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            this.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/login`, credentials);
      const { accessToken, refreshToken, username, role } = response.data;
      
      this.setTokens(accessToken, refreshToken);
      this.setUserInfo(username, role);
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/register`, userData);
      const { accessToken, refreshToken, username, role } = response.data;
      
      this.setTokens(accessToken, refreshToken);
      this.setUserInfo(username, role);
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const request: RefreshTokenRequest = { refreshToken: this.refreshToken };
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, request);
      const { accessToken, refreshToken, username, role } = response.data;
      
      this.setTokens(accessToken, refreshToken);
      this.setUserInfo(username, role);
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  logout(): void {
    if (this.refreshToken) {
      // Call logout API to invalidate refresh token
      axios.post(`${API_BASE_URL}/auth/logout`, { refreshToken: this.refreshToken })
        .catch(() => {
          // Ignore errors, we're logging out anyway
        });
    }

    this.clearStorage();
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private setUserInfo(username: string, role: string): void {
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);
  }

  private clearStorage(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  isAdmin(): boolean {
    const role = localStorage.getItem('role');
    return role === 'ADMIN';
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}

export default new AuthService();
