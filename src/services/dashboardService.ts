import { apiClient } from './apiClient';
import type { SpendingCategory, MonthlyData, CategoryBreakdown } from '../types';
import { spendingData, monthlyData, categoryData } from '../mocks';

export const dashboardService = {
  async getSpendingData(): Promise<SpendingCategory[]> {
    try {
      return await apiClient.get<SpendingCategory[]>('/dashboard/spending');
    } catch (error) {
      console.warn('[DashboardService] API failed, falling back to mock data', error);
      return spendingData;
    }
  },

  async getMonthlyData(): Promise<MonthlyData[]> {
    try {
      return await apiClient.get<MonthlyData[]>('/analytics/monthly');
    } catch (error) {
      console.warn('[DashboardService] API failed, falling back to mock data', error);
      return monthlyData;
    }
  },

  async getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
    try {
      return await apiClient.get<CategoryBreakdown[]>('/analytics/categories');
    } catch (error) {
      console.warn('[DashboardService] API failed, falling back to mock data', error);
      return categoryData;
    }
  },
};
