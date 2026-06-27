import type {
  DiscoveredAccountsResponse,
  OnboardingStatusResponse,
} from '../api/types';
import { apiClient } from './apiClient';

export const onboardingService = {
  async getStatus(): Promise<OnboardingStatusResponse> {
    return apiClient.get<OnboardingStatusResponse>('/onboarding/status');
  },

  async submitBvn(bvn: string, phone: string): Promise<{
    message: string;
    maskedPhone?: string;
    devOtp?: string;
  }> {
    return apiClient.post('/onboarding/bvn/submit', { bvn, phone });
  },

  async sendBvnOtp(): Promise<{ message: string; maskedPhone?: string; devOtp?: string }> {
    return apiClient.post('/onboarding/bvn/send-otp');
  },

  async verifyBvnOtp(code: string): Promise<{ message: string; currentStep?: string }> {
    return apiClient.post('/onboarding/bvn/verify-otp', { code });
  },

  async getDiscoveredAccounts(): Promise<DiscoveredAccountsResponse> {
    return apiClient.get<DiscoveredAccountsResponse>('/onboarding/bvn/accounts');
  },

  async connectDiscoveredAccounts(accountIds: string[]): Promise<{ message: string }> {
    return apiClient.post('/onboarding/bvn/connect', { accountIds });
  },
};