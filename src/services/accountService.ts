import { mapLinkedAccount } from '../api/mappers';
import type { AccountsResponse, LinkAccountResponse } from '../api/types';
import type { BankAccount } from '../types';
import { apiClient } from './apiClient';

export const accountService = {
  async getAll(): Promise<BankAccount[]> {
    const response = await apiClient.get<AccountsResponse>('/accounts');
    return response.accounts.map(mapLinkedAccount);
  },

  async link(institution: string, mockAccountRef?: string): Promise<BankAccount> {
    const response = await apiClient.post<LinkAccountResponse>('/accounts/link', {
      institution,
      mockAccountRef,
    });
    return mapLinkedAccount(response.account);
  },

  async disconnect(accountId: string): Promise<void> {
    await apiClient.delete(`/accounts/${accountId}`);
  },
};