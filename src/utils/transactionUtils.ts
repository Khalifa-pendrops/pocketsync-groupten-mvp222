import mongoose from 'mongoose';
import sanitizeHtml from 'sanitize-html';
import LinkedAccount, { ILinkedAccount } from '../models/LinkedAccount';
import { ITransaction } from '../models/Transaction';

export const generateReference = (): string =>
  `REF${Date.now()}${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

export const ngnToKobo = (amountNgn: number): number => Math.round(amountNgn * 100);

export const koboToNgn = (amountKobo: number): number => amountKobo / 100;

export const parseAmountNgn = (amount: unknown): number | null => {
  let numeric: number;

  if (typeof amount === 'number') {
    numeric = amount;
  } else if (typeof amount === 'string' && amount.trim() !== '') {
    numeric = Number(amount);
  } else {
    return null;
  }

  if (!Number.isFinite(numeric)) return null;

  const kobo = ngnToKobo(numeric);
  if (kobo < 100) return null; // minimum ₦1.00
  return numeric;
};

export const getOwnedActiveAccount = async (
  userId: string,
  accountId: unknown,
): Promise<ILinkedAccount | null> => {
  if (typeof accountId !== 'string' || !mongoose.Types.ObjectId.isValid(accountId)) {
    return null;
  }

  return LinkedAccount.findOne({
    _id: accountId,
    userId,
    isActive: true,
  });
};

export type DebitResult =
  | { ok: true; account: ILinkedAccount }
  | { ok: false; reason: 'NOT_FOUND' | 'INSUFFICIENT_FUNDS' };

/** Atomically debit an account if balance is sufficient — no replica-set transaction required */
export const debitAccountAtomic = async (
  userId: string,
  accountId: string,
  amountKobo: number,
): Promise<DebitResult> => {
  const updated = await LinkedAccount.findOneAndUpdate(
    {
      _id: accountId,
      userId,
      isActive: true,
      balance: { $gte: amountKobo },
    },
    { $inc: { balance: -amountKobo } },
    { new: true },
  );

  if (updated) {
    return { ok: true, account: updated };
  }

  const exists = await LinkedAccount.findOne({ _id: accountId, userId, isActive: true });
  if (!exists) {
    return { ok: false, reason: 'NOT_FOUND' };
  }

  return { ok: false, reason: 'INSUFFICIENT_FUNDS' };
};

/** Atomically credit an account */
export const creditAccountAtomic = async (
  userId: string,
  accountId: string,
  amountKobo: number,
): Promise<ILinkedAccount | null> =>
  LinkedAccount.findOneAndUpdate(
    { _id: accountId, userId, isActive: true },
    { $inc: { balance: amountKobo } },
    { new: true },
  );

export const formatTransaction = (transaction: ITransaction) => ({
  id: transaction._id,
  date: transaction.date,
  description: transaction.description,
  amount: koboToNgn(transaction.amount),
  type: transaction.type,
  category: transaction.category,
  institution: transaction.institution,
  accountId: transaction.accountId,
  reference: transaction.reference,
});

export const maskAccountNumber = (accountNumber: string): string =>
  `****${accountNumber.slice(-4)}`;

const sanitizeLabel = (value: string, maxLength: number): string =>
  sanitizeHtml(value.trim(), { allowedTags: [], allowedAttributes: {} }).slice(0, maxLength);

/** Any Nigerian bank name — not limited to PocketSync linkable institutions */
export const parseRecipientBank = (bank: unknown): string | null => {
  if (typeof bank !== 'string' || !bank.trim()) return null;
  const cleaned = sanitizeLabel(bank, 100);
  return cleaned.length >= 2 ? cleaned : null;
};

export const parseRecipientName = (name: unknown): string => {
  if (typeof name !== 'string' || !name.trim()) return 'Recipient';
  const cleaned = sanitizeLabel(name, 100);
  return cleaned.length >= 1 ? cleaned : 'Recipient';
};

export const formatAccountSnapshot = (account: ILinkedAccount) => ({
  id: account._id,
  institution: account.institution,
  maskedAccountNumber: account.maskedAccountNumber,
  balance: koboToNgn(account.balance),
  currency: account.currency,
  accountType: account.accountType,
});