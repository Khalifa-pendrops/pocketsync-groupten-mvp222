import type { Transaction } from '../types';

export const mockTransactions: Transaction[] = [
  { id: '1', name: 'Chiamaka Opal', desc: 'Transfer to 0024561190', amount: -150000, date: 'Today, 9:41 AM', type: 'transfer' },
  { id: '2', name: 'Electricity Bill', desc: 'EEDC Enugu', amount: -75000, date: 'Yesterday, 10:05 AM', type: 'bills' },
  { id: '3', name: 'Adaeze Okeke', desc: 'Transfer to 0034567890', amount: -200000, date: 'Jun 20, 10:30 AM', type: 'transfer' },
  { id: '4', name: 'Ifeanyi Uche', desc: 'Transfer from 0045678901', amount: 50000, date: 'Jun 18, 11:15 AM', type: 'receive' },
  { id: '5', name: 'Airtime Purchase', desc: 'MTN NG', amount: -120000, date: 'Apr 24, 11:45 AM', type: 'airtime' },
  { id: '6', name: 'NEPA Bill', desc: 'Ikeja Electric', amount: -45000, date: 'Apr 22, 2:30 PM', type: 'bills' },
  { id: '7', name: 'John Obi', desc: 'Transfer from 0098765432', amount: 150000, date: 'Apr 20, 8:15 AM', type: 'receive' },
  { id: '8', name: 'Data Bundle', desc: 'Glo NG', amount: -15000, date: 'Apr 19, 6:45 PM', type: 'airtime' },
];
