import { mapTransactionRow } from '../api/mappers';
import type {
  InternalTransferResponse,
  InterbankTransferResponse,
  TransactionsResponse,
} from '../api/types';
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

export interface InternalTransferPayload {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
}

export interface InterbankTransferPayload {
  fromAccountId: string;
  recipientBank: string;
  recipientAccountNumber: string;
  recipientName?: string;
  amount: number;
  description?: string;
}

export const transactionService = {
  async transferInternal(payload: InternalTransferPayload): Promise<InternalTransferResponse> {
    return apiClient.post<InternalTransferResponse>('/transactions/transfer', payload);
  },

  async transferInterbank(payload: InterbankTransferPayload): Promise<InterbankTransferResponse> {
    return apiClient.post<InterbankTransferResponse>(
      '/transactions/interbank-transfer',
      payload,
    );
  },

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