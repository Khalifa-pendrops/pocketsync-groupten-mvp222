import type { SpendingCategory, MonthlyData, CategoryBreakdown } from '../types';

export const spendingData: SpendingCategory[] = [
  { name: 'Transfer', value: 65, color: '#ef4444' },
  { name: 'Bills', value: 45, color: '#9333ea' },
  { name: 'Receive', value: 20, color: '#10b981' },
  { name: 'Others', value: 9, color: '#6b7280' },
];

export const monthlyData: MonthlyData[] = [
  { name: 'Jan', income: 400, expenses: 240 },
  { name: 'Feb', income: 300, expenses: 220 },
  { name: 'Mar', income: 500, expenses: 310 },
  { name: 'Apr', income: 450, expenses: 280 },
  { name: 'May', income: 470, expenses: 260 },
  { name: 'Jun', income: 520, expenses: 340 },
];

export const categoryData: CategoryBreakdown[] = [
  { name: 'Transfer', amount: 425000, percent: 42, color: '#ef4444' },
  { name: 'Bills', amount: 195000, percent: 19, color: '#9333ea' },
  { name: 'Receive', amount: 180000, percent: 18, color: '#10b981' },
  { name: 'Airtime', amount: 120000, percent: 12, color: '#f59e0b' },
  { name: 'Others', amount: 90000, percent: 9, color: '#6b7280' },
];
