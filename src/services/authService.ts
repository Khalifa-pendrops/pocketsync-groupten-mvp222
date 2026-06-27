import { apiClient, setAuthToken } from './apiClient';
import type { AuthCredentials, AuthResponse } from '../types';

export const authService = {
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const data = await apiClient.post<AuthResponse>('/auth/login', credentials);
    setAuthToken(data.token);
    return data;
  },

  async register(credentials: AuthCredentials): Promise<AuthResponse> {
    const data = await apiClient.post<AuthResponse>('/auth/register', credentials);
    setAuthToken(data.token);
    return data;
  },

  logout(): void {
    setAuthToken(null);
  },
};
