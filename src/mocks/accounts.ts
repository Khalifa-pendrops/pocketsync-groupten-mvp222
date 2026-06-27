import type { BankAccount } from '../types';

export const mockAccounts: BankAccount[] = [
  { id: '1', bankName: 'Zenith Bank', maskAccount: '**** 1234', balance: 30_000_000, accountType: 'Savings', status: 'Active' },
  { id: '2', bankName: 'Access Bank', maskAccount: '**** 5678', balance: 100_000_000, accountType: 'Current', status: 'Active' },
  { id: '3', bankName: 'Opay', maskAccount: '**** 9012', balance: 100_000, accountType: 'Opay Wallet', status: 'Active' },
  { id: '4', bankName: 'GTBank', maskAccount: '**** 3456', balance: 50_000, accountType: 'Savings', status: 'Active' },
];

export const bankLogos: Record<string, string> = {
  'Zenith Bank': '/src/assets/images/zenith.png',
  'Access Bank': '/src/assets/images/access.png',
  'Opay': '/src/assets/images/opay.png',
  'GTBank': '/src/assets/images/gtbank.png',
};

export const logoColors: Record<string, string> = {
  'Zenith Bank': '#1a3a6b',
  'Access Bank': '#e30613',
  'Opay': '#00a85d',
  'GTBank': '#6b3fa0',
};
