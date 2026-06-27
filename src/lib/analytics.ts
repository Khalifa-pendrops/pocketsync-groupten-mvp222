import type { DashboardSummaryResponse } from '../api/types';
import { CATEGORY_COLORS } from '../constants/institutions';
import type { CategoryBreakdown, MonthlyData } from '../types';
import type { TransactionRow } from '../types';

export interface AnalyticsSummaryCards {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  avgDailySpend: number;
  incomeChange: string | null;
  expenseChange: string | null;
  savingsChange: string | null;
  spendChange: string | null;
}

export function buildCategoryBreakdown(
  breakdown: DashboardSummaryResponse['expenseBreakdown'],
): CategoryBreakdown[] {
  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

  if (total <= 0) {
    return [];
  }

  return breakdown
    .map((item) => ({
      name: item.category,
      amount: item.amount,
      percent: Math.round((item.amount / total) * 100),
      color: CATEGORY_COLORS[item.category] ?? '#6b7280',
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function buildMonthlyIncomeExpenses(
  transactions: TransactionRow[],
  monthLabels: string[],
): MonthlyData[] {
  const buckets = new Map<string, { income: number; expenses: number }>();

  transactions.forEach((tx) => {
    const label = new Date(tx.date).toLocaleString('en-US', { month: 'short' });
    const bucket = buckets.get(label) ?? { income: 0, expenses: 0 };

    if (tx.type === 'credit') {
      bucket.income += Math.abs(tx.amount);
    } else {
      bucket.expenses += Math.abs(tx.amount);
    }

    buckets.set(label, bucket);
  });

  return monthLabels.map((name) => {
    const bucket = buckets.get(name) ?? { income: 0, expenses: 0 };
    return { name, income: bucket.income, expenses: bucket.expenses };
  });
}

function formatChange(current: number, previous: number): string | null {
  if (previous === 0) {
    return null;
  }

  const pct = ((current - previous) / previous) * 100;
  const arrow = pct >= 0 ? '↑' : '↓';
  return `${arrow} ${Math.abs(pct).toFixed(1)}% vs prior month`;
}

export function buildSummaryCards(
  summary: DashboardSummaryResponse,
  monthlyData: MonthlyData[],
): AnalyticsSummaryCards {
  const avgDailySpend = summary.monthlyExpense / 30;

  const lastMonth = monthlyData.at(-1);
  const priorMonth = monthlyData.at(-2);

  return {
    totalIncome: summary.monthlyIncome,
    totalExpenses: summary.monthlyExpense,
    netCashFlow: summary.netCashFlow,
    avgDailySpend,
    incomeChange:
      lastMonth && priorMonth ? formatChange(lastMonth.income, priorMonth.income) : null,
    expenseChange:
      lastMonth && priorMonth ? formatChange(lastMonth.expenses, priorMonth.expenses) : null,
    savingsChange:
      lastMonth && priorMonth
        ? formatChange(
            lastMonth.income - lastMonth.expenses,
            priorMonth.income - priorMonth.expenses,
          )
        : null,
    spendChange:
      lastMonth && priorMonth
        ? formatChange(lastMonth.expenses / 30, priorMonth.expenses / 30)
        : null,
  };
}