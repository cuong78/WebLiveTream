export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
  role: string;
  message?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface User {
  username: string;
  role: string;
}
