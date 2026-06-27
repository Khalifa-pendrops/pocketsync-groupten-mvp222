import { apiClient } from './apiClient';
import type { BankAccount } from '../types';
import { mockAccounts } from '../mocks';

export const accountService = {
  async getAll(): Promise<BankAccount[]> {
    try {
      return await apiClient.get<BankAccount[]>('/accounts');
    } catch (error) {
      console.warn('[AccountService] API failed, falling back to mock data', error);
      return mockAccounts;
    }
  },
};
