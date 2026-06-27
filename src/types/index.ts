export interface Institution {
  id: string;
  name: string;
  masked: string;
  category: string;
  logoSrc?: string;
  initial: string;
  logoColor: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  maskAccount: string;
  balance: number;
  accountType: string;
  status: 'Active' | 'Inactive';
}

export interface Transaction {
  id: number;
  name: string;
  desc: string;
  amount: number;
  date: string;
  type: string;
}

export interface SpendingCategory {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyData {
  name: string;
  income: number;
  expenses: number;
}

export interface CategoryBreakdown {
  name: string;
  amount: number;
  percent: number;
  color: string;
}

export interface Bill {
  name: string;
  category: string;
  amount: number;
  due: string;
  overdue: boolean;
}

export interface BillCategory {
  name: string;
  icon: string;
  count: number;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}
