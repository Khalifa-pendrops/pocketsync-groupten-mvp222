import type { BillProvider, PayBillResponse } from '../api/types';
import { apiClient } from './apiClient';

export interface PayBillPayload {
  fromAccountId: string;
  amount: number;
  billProvider: BillProvider;
  customerReference?: string;
  description?: string;
}

export const billService = {
  async pay(payload: PayBillPayload): Promise<PayBillResponse> {
    return apiClient.post<PayBillResponse>('/transactions/pay-bill', payload);
  },
};