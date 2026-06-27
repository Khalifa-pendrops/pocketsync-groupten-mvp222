import type { Bill, BillCategory } from '../types';
import { mockBills, billCategories } from '../mocks';

/** No backend bill-list endpoints yet — mock data only until API is added. */
export const budgetService = {
  async getBills(): Promise<Bill[]> {
    return mockBills;
  },

  async getCategories(): Promise<BillCategory[]> {
    return billCategories;
  },
};