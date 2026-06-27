import accessLogo from '../assets/images/access.png';
import gtbankLogo from '../assets/images/gtbank.png';
import opayLogo from '../assets/images/opay.png';

export interface InstitutionMeta {
  logo?: string;
  color: string;
  initial: string;
}

export type InstitutionCategory = 'Banks' | 'Fintechs' | 'Microfinance Banks';

export const INSTITUTION_META: Record<string, InstitutionMeta> = {
  GTBank: { logo: gtbankLogo, color: '#6b3fa0', initial: 'G' },
  'Access Bank': { logo: accessLogo, color: '#e30613', initial: 'A' },
  Kuda: { color: '#7c3aed', initial: 'K' },
  Opay: { logo: opayLogo, color: '#00a85d', initial: 'O' },
  Moniepoint: { color: '#2563eb', initial: 'M' },
};

export const INSTITUTION_CATEGORIES: Record<string, InstitutionCategory> = {
  GTBank: 'Banks',
  'Access Bank': 'Banks',
  Kuda: 'Fintechs',
  Opay: 'Fintechs',
  Moniepoint: 'Microfinance Banks',
};

export interface LinkableInstitution {
  id: string;
  name: string;
  category: InstitutionCategory;
  meta: InstitutionMeta;
}

export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#ef4444',
  Transport: '#f59e0b',
  Bills: '#9333ea',
  Entertainment: '#ec4899',
  Savings: '#10b981',
  Transfer: '#3b82f6',
  Other: '#6b7280',
};