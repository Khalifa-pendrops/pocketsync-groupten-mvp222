import { apiClient } from './apiClient';
import type { Institution } from '../types';
import { mockInstitutions } from '../mocks';

export const institutionService = {
  async getAll(): Promise<Institution[]> {
    try {
      return await apiClient.get<Institution[]>('/institutions');
    } catch (error) {
      console.warn('[InstitutionService] API failed, falling back to mock data', error);
      return mockInstitutions;
    }
  },
};
