export const TRANSACTION_CATEGORIES = [
  'Food',
  'Transport',
  'Bills',
  'Entertainment',
  'Savings',
  'Transfer',
  'Other',
] as const;

export const SUPPORTED_BILL_PROVIDERS = [
  'DSTV',
  'GOTV',
  'IKEDC',
  'EKEDC',
  'MTN',
  'Airtel',
  'Glo',
  '9mobile',
  'LAWMA',
  'Water Board',
] as const;

export type BillProvider = (typeof SUPPORTED_BILL_PROVIDERS)[number];