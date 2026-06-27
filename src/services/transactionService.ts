import { apiClient } from './apiClient';
import type { Transaction } from '../types';
import { mockTransactions } from '../mocks';

export const transactionService = {
  async getAll(): Promise<Transaction[]> {
    try {
      return await apiClient.get<Transaction[]>('/transactions');
    } catch (error) {
      console.warn('[TransactionService] API failed, falling back to mock data', error);
      return mockTransactions;
    }
  },
};
