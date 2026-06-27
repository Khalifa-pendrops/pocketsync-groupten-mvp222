import { apiClient } from './apiClient';
import type {
  LoginResponse,
  MessageResponse,
  RegisterResponse,
} from '../api/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  username?: string;
  confirmPassword?: string;
  termsAccepted: boolean;
}

export interface VerifyOtpPayload {
  email: string;
  code: string;
  purpose: 'signup' | 'reset';
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>('/auth/register', payload);
  },

  async logout(): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/auth/logout');
  },

  async refresh(): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/auth/refresh');
  },

  async sendOtp(email: string, purpose: 'signup' | 'reset'): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/auth/send-otp', { email, purpose });
  },

  async verifyOtp(payload: VerifyOtpPayload): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/auth/verify-otp', payload);
  },

  async forgotPassword(email: string): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/auth/forgot-password', { email });
  },

  async resetPassword(payload: {
    email: string;
    code: string;
    password: string;
    confirmPassword?: string;
  }): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/auth/reset-password', {
      email: payload.email,
      code: payload.code,
      newPassword: payload.password,
    });
  },
};