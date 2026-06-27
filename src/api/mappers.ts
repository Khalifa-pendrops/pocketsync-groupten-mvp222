import type { ApiLinkedAccount, ApiTransaction } from './types';
import type { BankAccount, Transaction, TransactionRow } from '../types';

export function mapLinkedAccount(account: ApiLinkedAccount): BankAccount {
  return {
    id: String(account.id),
    bankName: account.institution,
    maskAccount: account.maskedAccountNumber,
    balance: account.balance,
    accountType: account.accountType,
    status: 'Active',
  };
}

export function mapTransaction(transaction: ApiTransaction): Transaction {
  return {
    id: String(transaction.id),
    name: transaction.description,
    desc: transaction.institution,
    amount: transaction.amount,
    date: transaction.date,
    type: transaction.type,
  };
}

export function mapTransactionRow(transaction: ApiTransaction): TransactionRow {
  return {
    id: String(transaction.id),
    description: transaction.description,
    institution: transaction.institution,
    category: transaction.category,
    amount: transaction.amount,
    type: transaction.type,
    date: transaction.date,
  };
}