import { apiClient } from './apiClient';
import type { Bill, BillCategory } from '../types';
import { mockBills, billCategories } from '../mocks';

export const budgetService = {
  async getBills(): Promise<Bill[]> {
    try {
      return await apiClient.get<Bill[]>('/bills');
    } catch (error) {
      console.warn('[BudgetService] API failed, falling back to mock data', error);
      return mockBills;
    }
  },

  async getCategories(): Promise<BillCategory[]> {
    try {
      return await apiClient.get<BillCategory[]>('/bills/categories');
    } catch (error) {
      console.warn('[BudgetService] API failed, falling back to mock data', error);
      return billCategories;
    }
  },
};
