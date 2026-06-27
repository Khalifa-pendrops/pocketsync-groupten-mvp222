import type { BalanceTrendResponse, DashboardSummaryResponse } from '../api/types';
import { apiClient } from './apiClient';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummaryResponse> {
    return apiClient.get<DashboardSummaryResponse>('/dashboard/summary');
  },

  async getBalanceTrend(): Promise<BalanceTrendResponse> {
    return apiClient.get<BalanceTrendResponse>('/dashboard/balance-trend');
  },
};