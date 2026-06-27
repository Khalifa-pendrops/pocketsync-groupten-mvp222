import { apiClient } from './apiClient';
import type { Institution, InstitutionApi } from '../types';
import { mockInstitutions } from '../mocks';

const logoColors: Record<string, string> = {
  'GTBank': '#6b3fa0',
  'Access Bank': '#e30613',
  'Kuda': '#6a1b9a',
  'Opay': '#00a85d',
  'Moniepoint': '#0d9488',
};

function mapInstitution(api: InstitutionApi, index: number): Institution {
  const firstLetter = api.name.charAt(0).toUpperCase();
  return {
    id: api.id,
    name: api.name,
    masked: `**** ${String(1000 + index).slice(1, 5)}`,
    category: ['Banks', 'Fintechs', 'Microfinance Banks'][index % 3] as Institution['category'],
    initial: firstLetter,
    logoColor: logoColors[api.name] || '#6b7280',
  };
}

export const institutionService = {
  async getAll(): Promise<Institution[]> {
    try {
      const raw = await apiClient.get<{ institutions: InstitutionApi[] }>('/institutions');
      const list = raw.institutions ?? raw;
      if (Array.isArray(list)) {
        return list.map(mapInstitution);
      }
      return mockInstitutions;
    } catch (error) {
      console.warn('[InstitutionService] API failed, falling back to mock data', error);
      return mockInstitutions;
    }
  },
};
