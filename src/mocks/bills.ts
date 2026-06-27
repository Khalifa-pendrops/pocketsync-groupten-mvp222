import type { Bill, BillCategory } from '../types';

export const billCategories: BillCategory[] = [
  { name: 'Electricity', icon: '💡', count: 2 },
  { name: 'Internet', icon: '🌐', count: 1 },
  { name: 'Airtime', icon: '📱', count: 3 },
  { name: 'TV Subscription', icon: '📺', count: 1 },
];

export const mockBills: Bill[] = [
  { name: 'EEDC Enugu', category: 'Electricity', amount: 75000, due: 'Jun 30, 2026', overdue: false },
  { name: 'Ikeja Electric', category: 'Electricity', amount: 45000, due: 'Jun 25, 2026', overdue: true },
  { name: 'MTN Data Plan', category: 'Airtime', amount: 15000, due: 'Jul 5, 2026', overdue: false },
  { name: 'GOtv Subscription', category: 'TV Subscription', amount: 8500, due: 'Jul 10, 2026', overdue: false },
];
