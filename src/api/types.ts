/** Backend-canonical API types — shapes match server responses exactly. */

export interface ApiUser {
  id: string;
  email: string;
  fullName?: string;
  emailVerified?: boolean;
  bvnVerified?: boolean;
}

export interface LoginResponse {
  message: string;
  user: ApiUser;
}

export interface RegisterResponse {
  message: string;
  userId: string;
  emailVerified: boolean;
  requiresVerification: boolean;
  resendAvailableIn?: number;
  emailDeliveryFailed?: boolean;
  devOtp?: string;
}

export interface MessageResponse {
  message: string;
  resendAvailableIn?: number;
  devOtp?: string;
}

export interface ApiInstitution {
  id: string;
  name: string;
}

export interface InstitutionsResponse {
  institutions: ApiInstitution[];
}

export interface ApiLinkedAccount {
  id: string;
  institution: string;
  maskedAccountNumber: string;
  balance: number;
  currency: string;
  accountType: string;
  linkedAt?: string;
}

export interface AccountsResponse {
  accounts: ApiLinkedAccount[];
}

export interface LinkAccountResponse {
  message: string;
  account: ApiLinkedAccount;
}

export type TransactionType = 'credit' | 'debit';

export type TransactionCategory =
  | 'Food'
  | 'Transport'
  | 'Bills'
  | 'Entertainment'
  | 'Savings'
  | 'Transfer'
  | 'Other';

export interface ApiTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  institution: string;
  accountId?: string;
  reference?: string;
}

export interface TransactionsResponse {
  total: number;
  page: number;
  pages: number;
  transactions: ApiTransaction[];
}

export interface DashboardSummaryResponse {
  totalBalance: number;
  currency: string;
  monthlyIncome: number;
  monthlyExpense: number;
  netCashFlow: number;
  accounts: ApiLinkedAccount[];
  recentTransactions: ApiTransaction[];
  expenseBreakdown: Array<{ category: string; amount: number }>;
}

export interface BalanceTrendResponse {
  labels: string[];
  data: number[];
}

export type BillProvider =
  | 'DSTV'
  | 'GOTV'
  | 'IKEDC'
  | 'EKEDC'
  | 'MTN'
  | 'Airtel'
  | 'Glo'
  | '9mobile'
  | 'LAWMA'
  | 'Water Board';

export interface PayBillResponse {
  message: string;
  payment: {
    reference: string;
    amount: number;
    billProvider: string;
    account: ApiLinkedAccount;
    transaction: ApiTransaction;
  };
}

export type OnboardingStep =
  | 'bvn_entry'
  | 'phone_otp'
  | 'connect_accounts'
  | 'complete';

export interface OnboardingStatusResponse {
  emailVerified: boolean;
  bvnVerified: boolean;
  phoneVerified: boolean;
  currentStep: OnboardingStep;
  maskedPhone?: string;
  pendingAccounts: number;
  linkedAccounts: number;
  onboardingComplete: boolean;
}

export interface ApiDiscoveredAccount {
  id: string;
  institution: string;
  maskedAccountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  holderName: string;
}

export interface DiscoveredAccountsResponse {
  accounts: ApiDiscoveredAccount[];
}