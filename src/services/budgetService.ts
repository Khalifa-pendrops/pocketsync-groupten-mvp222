import type { Bill, BillCategory } from '../types';
import { mockBills, billCategories } from '../mocks';

export const budgetService = {
  async getBills(): Promise<Bill[]> {
    return mockBills;
  },

  async getCategories(): Promise<BillCategory[]> {
    return billCategories;
  },
};