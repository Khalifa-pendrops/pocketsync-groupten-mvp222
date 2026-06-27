import type { InstitutionsResponse } from '../api/types';
import { apiClient } from './apiClient';

export const institutionService = {
  async getAll(): Promise<InstitutionsResponse['institutions']> {
    const response = await apiClient.get<InstitutionsResponse>('/institutions');
    return response.institutions;
  },
};