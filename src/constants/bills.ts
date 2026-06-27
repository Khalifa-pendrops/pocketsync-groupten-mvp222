import type { BillProvider } from '../api/types';

export interface BillCatalogItem {
  id: string;
  name: string;
  displayCategory: string;
  billProvider: BillProvider;
  amount: number;
  due: string;
  overdue: boolean;
  icon: 'electricity' | 'airtime' | 'tv' | 'internet';
}

/** MVP bill catalog — payments use POST /transactions/pay-bill (no bill-list API). */
export const BILL_CATALOG: BillCatalogItem[] = [
  {
    id: 'eedc',
    name: 'EEDC Enugu',
    displayCategory: 'Electricity',
    billProvider: 'EKEDC',
    amount: 75000,
    due: 'Jun 30, 2026',
    overdue: false,
    icon: 'electricity',
  },
  {
    id: 'ikedc',
    name: 'Ikeja Electric',
    displayCategory: 'Electricity',
    billProvider: 'IKEDC',
    amount: 45000,
    due: 'Jun 25, 2026',
    overdue: true,
    icon: 'electricity',
  },
  {
    id: 'mtn',
    name: 'MTN Data Plan',
    displayCategory: 'Airtime',
    billProvider: 'MTN',
    amount: 15000,
    due: 'Jul 5, 2026',
    overdue: false,
    icon: 'airtime',
  },
  {
    id: 'gotv',
    name: 'GOtv Subscription',
    displayCategory: 'TV Subscription',
    billProvider: 'GOTV',
    amount: 8500,
    due: 'Jul 10, 2026',
    overdue: false,
    icon: 'tv',
  },
];

export const BILL_CATEGORY_SUMMARY = [
  { name: 'Electricity', icon: 'electricity' as const, count: 2 },
  { name: 'Internet', icon: 'internet' as const, count: 0 },
  { name: 'Airtime', icon: 'airtime' as const, count: 1 },
  { name: 'TV Subscription', icon: 'tv' as const, count: 1 },
];