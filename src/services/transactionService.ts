import { mapTransactionRow } from '../api/mappers';
import type { TransactionsResponse } from '../api/types';
import type { TransactionRow } from '../types';
import { apiClient } from './apiClient';

export interface TransactionQuery {
  accountId?: string;
  category?: string;
  type?: 'credit' | 'debit';
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface TransactionPage {
  transactions: TransactionRow[];
  total: number;
  page: number;
  pages: number;
}

export const transactionService = {
  async getPage(query: TransactionQuery = {}): Promise<TransactionPage> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.set(key, String(value));
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/transactions?${queryString}` : '/transactions';
    const response = await apiClient.get<TransactionsResponse>(endpoint);

    return {
      transactions: response.transactions.map(mapTransactionRow),
      total: response.total,
      page: response.page,
      pages: response.pages,
    };
  },
};